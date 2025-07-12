package main
import (
	"fmt"
    "time"
    "crypto/sha256"
    "encoding/hex"
)
type Block struct {
    Prevhash string
    Hash string
    Data string
    Timestamp int64
}

func (block Block) ToString() string {
    return fmt.Sprintf(
`----Block-------------------------------------
    Prevhash: %s
    Hash: %s
    Data: %s
    Timestamp: %d
----------------------------------------------
`, block.Prevhash, block.Hash, block.Data, block.Timestamp)
}

const GENESIS_HASH = "g3nes1s-b10ck"

func GenesisBlock() Block {
    return Block {
        Prevhash: "",
        Hash: GENESIS_HASH,
        Data: "",
        Timestamp: 0,
    }
}

func (block Block) Equal(other Block) bool {
    return block.Hash == other.Hash && block.Prevhash == other.Prevhash && block.Timestamp == other.Timestamp && block.Data == other.Data
}

func MineBlock(prevHash, data  string) Block {
    timestamp := time.Now().UnixMilli()
    raw_hash := sha256.Sum256([]byte(fmt.Sprintf(`{%s}-{%s}-{%d}`, prevHash, data, timestamp)))
    hash := hex.EncodeToString(raw_hash[:])
    return Block {
        Prevhash: prevHash,
        Hash: hash,
        Data: data,
        Timestamp: timestamp,
    }
}

func ValidateBlockChain(blocks []Block) bool {
    if len(blocks) == 0 {
        return false
    }

    if !GenesisBlock().Equal(blocks[0]) {
        return false
    }

    for i := 1; i < len(blocks); i += 1 {
        if blocks[i].Prevhash != blocks[i-1].Hash || blocks[i].Timestamp < blocks[i-1].Timestamp {
            return false
        }
    }

    return true
}
