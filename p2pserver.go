package main
import (
	"net"
)

type P2PChannelData struct {string; error}
type P2PChannel chan P2PChannelData
type P2PServer struct {
    Addr string
    Peers []string
    Handler func(net.Conn) error
}

func (sv *P2PServer) handleClient(conn net.Conn, chann P2PChannel) {
	defer conn.Close()
	err := sv.Handler(conn)
	chann <- P2PChannelData{conn.RemoteAddr().String(), err}
}

func (sv *P2PServer) handleServerConnection(conn net.Conn) {
	defer conn.Close()
	sv.Handler(conn)
	olog(INFO, "Connection ", conn.RemoteAddr().String(), " closed!");
}

func (sv *P2PServer) connnectToPeers() {
    channels := make(P2PChannel, len(sv.Peers) * 2)
    defer close(channels)
    for i := 0; i < len(sv.Peers); i++ {
        channels <- struct {string; error}{sv.Peers[i], nil}
    }

    for data := range channels {
        if data.error != nil {
            olog(WARNING, "Error happen for ", data.string, ", error: ", data.error.Error())
        }
        olog(INFO, "Connecting to ", data.string, "...")
        conn, err := net.Dial("tcp", data.string)
        olog(INFO, "Connected to ", data.string)
        if err != nil {
            channels <- struct {string; error}{data.string, err}
            continue
        }

        go sv.handleClient(conn, channels)
    }
}

func (sv *P2PServer) Start() error {
    server, err := net.Listen("tcp", sv.Addr)
    if err != nil {
        return err
    }
    defer server.Close()
	go sv.connnectToPeers()
    olog(INFO, "Listening on ", server.Addr().String())
    for {
        conn, err := server.Accept()
        if err != nil {
            olog(ERROR, "Failed to accept connection, error ", err.Error())
            continue
        }

        olog(INFO, "New connection ", conn.RemoteAddr().String())
		go sv.handleServerConnection(conn)
    }
}

