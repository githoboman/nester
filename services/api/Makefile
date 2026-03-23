BINARY=server

build:
	go build -o bin/$(BINARY) ./cmd/server

run:
	go run ./cmd/server

test:
	go test ./...

fmt:
	go fmt ./...

fmt-check:
	@if gofmt -l . | grep -q .; then echo "formatting issues found"; exit 1; fi

lint:
	golangci-lint run
