package main
import (
	"slices"
	"net"
	"time"
	"encoding/json"
)

const (
	DEFAULT_CHANNEL_BUFFER = 128
)

type P2PChannelData struct {string; error}
type P2PChannel chan P2PChannelData
type P2PServer struct {
    Addr string
    Peers []string
    Handler func(message any) error
    BroadCastChannel chan string

	newConnChannel chan net.Conn
	clientDeadChannel chan string
}

func (sv *P2PServer) connnectToPeers() {
	for _, id := range sv.Peers {
		sv.clientDeadChannel <- id
    }

	for client_dead_id := range sv.clientDeadChannel {
		if !slices.Contains(sv.Peers, client_dead_id) {
			continue
		}
		olog(INFO, "Connecting to ", client_dead_id, "...")
		conn, err := net.Dial("tcp", client_dead_id)
		if err != nil {
			olog(WARNING, "Failed to connect to ", client_dead_id, ", error: ", err.Error())
			go func(duration time.Duration, id string, done_channel chan string) {
				time.Sleep(duration)
				done_channel <- id
			}(5000 * time.Millisecond, client_dead_id, sv.clientDeadChannel)
			continue
		}
		sv.newConnChannel <- conn
	}
}

func handleRead(id string, conn net.Conn, done_channel chan string, handler func(any) error) {
	decoder := json.NewDecoder(conn)
	var data any
	for {
		err := decoder.Decode(&data)
		if err != nil {
			olog(ERROR, "Error when reading json from connection, error: ", err.Error())
			done_channel <- id
			break
		}
		err = handler(data)
		if err != nil {
			olog(ERROR, "Error when handling message, error: ", err.Error())
			done_channel <- id
			break
		}
	}
}

func handleWrite(id string, conn net.Conn, write_channel chan string) {
	for data := range write_channel {
		_, err := conn.Write([]byte(data))
		if err != nil {
			olog(ERROR, "Failed to write '", data, "' to connection ", conn.RemoteAddr().String())
		}
	}
}

type Writer struct {
	conn net.Conn
	channel chan string
}

func (sv *P2PServer) handleBroadCast() {
	done_channel := make(chan string, 10)
	defer close(done_channel)
	writers := make(map[string]Writer)
	defer func(writers map[string]Writer) {
		for _, writer := range writers {
			close(writer.channel)
			writer.conn.Close()
		}
	}(writers)
	for {
		select {
		case conn := <- sv.newConnChannel:
			id := conn.RemoteAddr().String()
			olog(INFO, "New connection ", id);

			write_channel := make(chan string, DEFAULT_CHANNEL_BUFFER)
			writers[id] = Writer { conn, write_channel }

			go handleRead(id, conn, done_channel, sv.Handler)
			go handleWrite(id, conn, write_channel)
		case message_to_sent := <- sv.BroadCastChannel:
			for _, writer := range writers {
				writer.channel <- message_to_sent
			}
		case done_id := <- done_channel:
			olog(INFO, "Connection ", done_id, " closed!");
			writer := writers[done_id]
			close(writer.channel)
			writer.conn.Close()
			delete(writers, done_id)
			sv.clientDeadChannel <- done_id
		}
	}
}

func (sv *P2PServer) Start() error {
	sv.clientDeadChannel = make(chan string, DEFAULT_CHANNEL_BUFFER)
	sv.newConnChannel = make(chan net.Conn, DEFAULT_CHANNEL_BUFFER)

	go sv.handleBroadCast()

	go sv.connnectToPeers()

    server, err := net.Listen("tcp", sv.Addr)
    if err != nil {
        return err
    }
    defer server.Close()
    olog(INFO, "Listening on ", server.Addr().String())
    for {
        conn, err := server.Accept()
        if err != nil {
            olog(ERROR, "Failed to accept connection, error ", err.Error())
            continue
        }
		sv.newConnChannel <- conn
    }
}

