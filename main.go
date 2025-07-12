package main
import (
	"os"
	"time"
    "fmt"
    "net"
)

func handleConnection(conn net.Conn) error {
	for {
		fmt.Fprintf(conn, "Hello bro\n")
		time.Sleep(1)
	}
	return nil
}

func main() {
	args := os.Args[:]
	_ = args[0]; args = args[1:];

	if len(args) == 0 {
		olog(FATAL, "No server address provided")
	}

	sv_addr := args[0]; args = args[1:]
	

    server := P2PServer {
        Addr: sv_addr,
		Peers: args,
        Handler: handleConnection,
    }
    server.Start()
}
