---
layout: "../../layouts/PostLayout.astro"
title: "Goroutines"
desc: "Quick notes on goroutines"
date: "2024-10-21"
author: "redacted"
---

> Use **WaitGroups** when you just need to wait for multiple goroutines to finish without passing data between them.

> Use **channels** when you need to **pass data** or **coordinate communication** between goroutines safely.

---

A _goroutine_ is a lightweight thread managed by the Go runtime. It works as a function or task that runs independently and can execute concurrently with other goroutines. Unlike traditional threads, goroutines are more efficient and easier to manage dur to low memory overhead.

When you start a function as a goroutine, it runs concurrently with other goroutines, including the main program.

```go
package main

import (
	"fmt"
	"time"
)

func printMessage(msg string) {
	for i := 0; i < 5; i++ {
		fmt.Println(msg)
		time.Sleep(500 * time.Millisecond)
	}
}

func main() {
	go printMessage("goroutine") // runs concurrently
	printMessage("main") // run synchronously
}
```

Here, in this code

- `printMessage` runs as a **goroutine**
- `main()` continues executing immediately after starting the goroutine
- Both main function and goroutine run concurrently.

Goroutine starts with only **2KB** of stack memory, and the stack can grow as needed. This makes them much lighter than system threads, which typically consumes more memory.

Goroutines are non-blocking; when it's created, the code continues executing without waiting for the goroutine to finish. However, if the main function exits before a goroutine completes, the goroutine will be terminated, as Go doesn't keep the program alive for orphaned goroutines.

But here if we remove `printMessage("main")` then the goroutine won't work at all... and that is where `WaitGroups` come in.

---

### `WaitGroups`

A `WaitGroup` allows you to wait for multiple goroutines to finish before the main function or another piece of code continues execution. It's ideal when you don't need to exchange data between goroutines but only need synchronization.

**Using `sync.WaitGroup` to wait for goroutines**

```go
package main

import (
	"fmt"
	"sync"
)

func printMessage(msg string, wg *sync.WaitGroup) {
	defer wg.Done() // notify that the goroutine is done
	fmt.Println(msg)
}

func main() {
	var wg sync.WaitGroup

	wg.Add(1) // tell the waitgroup that 1 goroutine will run
	go printMessage("goroutine", &wg)

	wg.Wait() // wait for all goroutines to finish
	fmt.Println("All goroutines finished")
}
```

- `sync.WaitGroup` ensures that the main program waits for the goroutine to complete.
- `wg.Add(1)` registers the goroutine, and `wg.Done()` signals that the goroutine is complete.
- `wg.Wait()` blocks the main function until all registered goroutines finish.

#### Use case of `WaitGroups`

**Downloading Multiple Files at a Time**

When you need to ensure that all concurrent downloads or tasks are completed before moving to the next step.

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func downloadFile(fileID int, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("Downloading file %d...\n", fileID)
	time.Sleep(2 * time.Second) // simulating file download
	fmt.Printf("File %d downloaded.\n", fileID)
}

func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go downloadFile(i, &wg)
	}

	wg.Wait() // wait for all downloads to complete
	fmt.Println("All files downloaded.")
}
```

**Parallel API Calls / Data Fetching**

Fetch data from multiple APIs or services concurrently, and wait for all the responses before aggregating the data.

**Example:** Querying multiple microservices and waiting for their responses before continuing.

**Batch Processing with Worker Pools**

Distribute tasks (like processing multiple images) across multiple workers running as goroutines and wait for all of them to complete.

**Example:**

- Processing multiple image transformations in parallel.
- Executing database queries across shards.

---

### Channels

Goroutines run independently, so they don't share memory by default. Channels allow you to safely communicate between goroutines. They allow you to send and receive values between goroutines without explicit locking mechanisms (like mutexes)

**Using channels to send a message from goroutine**

```go
package main

import "fmt"

func sendMessage(ch chan string) {
	ch <- "goroutine" // send message to channel
}

func main() {
	ch := make(chan string) // create channel

	go sendMessage(ch) // start goroutine

	msg := <- ch // receive message from channel
	fmt.Println(msg)
}
```

- Channel `ch` is used to pass the message between the goroutine and the main function
- Channels ensure safe communication between concurrent processes.

#### Use case of Channels

**Sending Results Between Goroutines**

One goroutine produces data, and another consumes it using a channel

**Example:** Summing a list of numbers using multiple workers.

```go
package main

import "fmt"

func sum(numbers []int, ch chan int) {
	total := 0
	for _, num := range numbers {
		total += num
	}
	ch <- total // send result to channel
}

func main() {
	numbers := []int{1, 2, 3, 4, 5, 6}
	ch := make(chan int)

	go sum(numbers[:len(numbers)/2], ch)
	go sum(numbers[len(numbers)/2:], ch)

	sum1, sum2 := <-ch, <-ch // receive results from both goroutines
	fmt.Println("Total sum:", sum1+sum2)
}
```

- Useful for dividing data processing across multiple goroutines and aggregating the results.

**Goroutine Coordination with `select`**

We can use `select` to listen on multiple channels at the same time, making decision based on which channel receives data first.

**Example:** Implementing a timeout or monitoring multiple sources of input.

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    ch := make(chan string)

    go func() {
        time.Sleep(2 * time.Second)
        ch <- "goroutine finished"
    }()

    select {
    case msg := <-ch:
        fmt.Println(msg)
    case <-time.After(1 * time.Second):
        fmt.Println("timeout occurred")
    }
}
```

- Time-sensitive tasks where you want to take action if a goroutine does not respond within a certain time.

**Buffer Channels for Task Queues**

A buffered channel allows sending multiple values without blocking, acting like a queue.

```go
package main

import "fmt"

func main() {
	ch := make(chan int, 3) // buffered channel with capacity of 3

	ch <- 1
	ch <- 2
	ch <- 3

	fmt.Println(<-ch)
	fmt.Println(<-ch)
	fmt.Println(<-ch)
}
```

- Task queues where producers can queue tasks even if consumers are temporarily unavailable.

---

### Comparison of WaitGroup vs Channels

| **Aspect**        | **WaitGroup**                      | **Channel**                                |
| ----------------- | ---------------------------------- | ------------------------------------------ |
| **Purpose**       | Synchronization of goroutines      | Communication between goroutines           |
| **When to Use**   | When no data exchange is needed    | When data needs to be passed               |
| **Blocking**      | `Wait()` blocks until tasks finish | Channel sends/receives block if unbuffered |
| **Best Use Case** | Waiting for multiple tasks         | Producer-consumer, pipelines               |
