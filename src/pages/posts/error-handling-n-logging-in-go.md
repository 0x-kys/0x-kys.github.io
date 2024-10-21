---
layout: "../../layouts/PostLayout.astro"
title: "Error Handling and Logging in Go"
desc: "A friendly guide on error handling and logging in golang so you can save your sanity."
date: "2024-10-21"
author: "redacted"
---

Allow me to tech you how you can do error handling in Go like a cutie pie and not use `panic()` everywhere like a noob.

So, first of all, there's no `try` and `catch` slop here. We can use `errors.New()` and `fmt.Errorf()` like a cool kid who ~~loves~~ can't stop yapping about Go.

---

#### Using `errors.New()` function

Literally my fav way of returning errors. **Recommended 10/10.**

```go
//
package main

import (
	"errors"
	"fmt"
)

func onlyPositiveNums(a int, b int) (int, error) {
	negativeError := errors.New("negative number detected opinion rejected")

	if a < 0 || b < 0 {
		return -1, negativeError
	}

	return a + b, nil
}

func main() {
	a := 1
	b := -1

	sum, err := onlyPositiveNums(a, b)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}

	fmt.Printf("Sum is %d\n", sum)
}
```

**Output:**

```txt
//
Error: negative number detected opinion rejected
```

- Here function `onlyPositiveNums` checks if both `a` and `b` are positive or not and return their sum.
- We use `errors.New()` to define our error message.
- Use our godlike conditional logic to check if numbers are positive or negative.
- Sadly I passed `1` and `-1` and it _rejected my opinion :c_

---

Cool and easy stuff, right? There are some reasons to love this way because it's:

- Simpler and Cleaner
- You can also compare error messages using `errors.Is()` function.
  - `if errors.Is(err, ErrNotFound) { fmt.Println("Item not found") }`
- Lightweight. No unnecessary memory overhead since it doesn't add extra formatting logic.
- Aligns well with Go's convention of declaring package-level sentinel errors (like `io.EOF`).

---

#### Using `fmt.Errorf()`

Enough of that yap. Now let's talk about `fmt.Errorf()` function. In this function you can throw some cool dynamic error messages. Below is same code that we used for `errors.New()` but here I used it in a separate function that only checks numbers and returns error if any number is negative.

```go
//
package main

import (
	"errors"
	"fmt"
)

func checkNumbers(a int, b int) error {
	opinionRejection := errors.New("negative number detected opinion rejected")

	if a < 0 || b < 0 {
		return opinionRejection
	}

	return nil
}

func onlyPositiveNums(a int, b int) (int, error) {
	err := checkNumbers(a, b)
	if err != nil {
		negativeError := fmt.Errorf("inputs were negative. get better. %v", err)
		return -1, negativeError
	}

	return a + b, nil
}

func main() {
	a := 1
	b := -1

	sum, err := onlyPositiveNums(a, b)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}

	fmt.Printf("Sum is %d\n", sum)
}

```

**Output:**

```txt
//
Error: inputs were negative. get better. negative number detected opinion rejected
```

Function `onlyPositiveNums` first executes `checkNumbers` function which'll return either an **error** or `nil` based on your input. Here it's returning an error.

We store that error in a variable `err` and then check if that error is `nil` or not. Ofc it's not so we write a cool message and then slap error of `checkNumbers` function with it.

When using other packages most functions return err so it's good to use `fmt.Errorf()` to print your custom message to see what exactly went wrong and where.

That's about enough information for your error handling needs. Also, DO NOT use `panic()` for everything lmao.

---

### We do a little logging :3 (`log`)

Aight, now we know how to throw them errors but when we hit production we really need some real logs with timestamps and error levels. So, we can use Go's `log` package. Very no-nonsense way of logging.

```go
//
package main

import (
	"errors"
	"log"
)

func checkNumbers(a, b int) error {
	if a < 0 || b < 0 {
		return errors.New("you really thought negative numbers would work?")
	}
	return nil
}

func main() {
	err := checkNumbers(1, -1)
	if err != nil {
		log.Printf("Oh no, something broke: %v", err) // logs error with timestamp
		return
	}
	log.Println("Everything is peachy. No errors today!") // just a nice info log
}
```

**Output:**

```txt
//
2024/10/21 23:30:00 Oh no, something broke: you really thought negative numbers would work?
```

Already cooler than using everywhere `fmt.Println()`. You can also use `log.Fatal()` which'll log message and **exit**. Handy when things are really on fire.

---

### Logrus!!

Now it's time to level-up and learn about `logrus` - Because you're not a rookie anymore.

[Logrus](https://github.com/sirupsen/logrus) is still super easy to use, but with structured logging, different log levels, and way cooler output.

First, install `logrus` in your go project:

```sh
#
go get github.com/sirupsen/logrus
```

```go
//
package main

import (
	"errors"
	log "github.com/sirupsen/logrus"
)

func checkNumbers(a, b int) error {
	if a < 0 || b < 0 {
		return errors.New("you really thought negative numbers would work?")
	}
	return nil
}

func main() {
	err := checkNumbers(1, -1)
	if err != nil {
		log.WithError(err).Error("Oh no, something broke") // logs with error context
		return
	}
	log.Info("Everything is peachy. No errors today!")
}
```

**Output:**

```txt
//
time="2024-10-21T12:30:15Z" level=error msg="Oh no, something broke" error="you really thought negative numbers would work?"
```

**Logrus** is really like the cool kid on the block.

- Structured Logging
- Log Levels (Debug, Info, Warn, Error, Fatal, Panic, etc.)
- Fancy JSON logs!! You can literally impress your DevOps team with this one ;3

```go
//
log.SetFormatter(&log.JSONFormatter{})
log.WithField("environment", "production").Info("Deployed!")
```

**Output:**

```txt
//
{"environment":"production","level":"info","msg":"Deployed!","time":"2024-10-21T12:30:15Z"}
```
