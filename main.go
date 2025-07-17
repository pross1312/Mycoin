package main
import (
	"time"
	"fmt"
	"os"
	"encoding/json"
)
var (
	msg_format = `{
	"message": "hello from %s!"
}`
	message string
)

func handleWriting(channel chan string) {
	for _ = range 100 {
		olog(INFO, "Broadcasting message `", message, "`")
		channel <- message
		time.Sleep(2 * time.Second)
	}
}

func handleNewMessage(message any) error {
	bytes, err := json.Marshal(message)
	if err != nil {
		return err
	}


	olog(INFO, "New message '", string(bytes), "'")
	return nil
}

func main() {
	args := os.Args[:]
	_ = args[0]; args = args[1:];

	if len(args) == 0 {
		olog(FATAL, "No server address provided")
	}

	sv_addr := args[0]; args = args[1:]
	message = fmt.Sprintf(msg_format, sv_addr)
	broad_cast_channel := make(chan string, DEFAULT_CHANNEL_BUFFER)
    server := P2PServer {
        Addr: sv_addr,
		Peers: args,
        Handler: handleNewMessage,
		BroadCastChannel : broad_cast_channel,
    }
	go handleWriting(broad_cast_channel)
    server.Start()
}
