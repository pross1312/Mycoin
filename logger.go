package main
import (
	"strings"
	"log"
)

type LogTag int
const (
    INFO LogTag = iota
    WARNING
    ERROR
    FATAL
)

func olog(tag LogTag, messages ...string) {
    var prefix string
    switch tag {
    case INFO: prefix = "[INFO] "
    case WARNING: prefix = "[WARNING] "
    case ERROR: prefix = "[ERROR] "
    case FATAL: prefix = "[FATAL] "
    }
    var builder strings.Builder
    builder.WriteString(prefix)
    for i := 0; i < len(messages); i++ {
        builder.WriteString(messages[i])
    }
    if (tag != FATAL) {
        log.Println(builder.String())
    } else {
        log.Fatal(builder.String())
    }
}
