---
layout: "../../layouts/PostLayout.astro"
title: "Testing and Benchmarking in Go"
desc: "You don't know how to write tests in Go? Learn it. Benchmarking here is cherry-on-top."
date: "2024-10-22"
author: "redacted"
---

Okay nerd birds now we let's learn some testing and benchmarking 'cause it's fun to not ship bugs to prod like an amateur.

So there's this built-in package in go called `testing` which exactly helps us with testing. We gonna do all this the Go way, simple and clean, just like writing an elegant function with zero bugs (ha. we wish.)

---

### Unit Testing like a Kino

First things first. Unit Tests. In Go, we have no time for over-complicated, unnecessary testing nonsense. We just whip up a `_test.go` file, and we're good to do.

**Basic Example with `testing.T`**

```go
// math.go
package math

func Add(a, b int) int {
	return a + b
}
```

We have a sweet and super awesome function `Add` that adds two numbers ofc. What else do you expect it to do for you? get a girlfriend? hell nah.

Anyways, now let's hit it with a test:

```go
// math_test.go
package math

import "testing"

func TestAdd(t *testing.T) {
	result := Add(2, 3)
	if result != 5 {
		t.Errorf("Expected 5, got %d", result)
	}
}
```

Easy stuff. No rocket science till now.

Running this is really easy you simple do `go test` and see the magic happen.

```txt
//
PASS
ok      testing-and-benchmarking     0.120s
```

and for a more juicy details you can use `go test -v`

```txt
//
=== RUN   TestAdd
--- PASS: TestAdd (0.00s)
PASS
ok      testing-and-benchmarking     0.123s
```

All this is super simple and easy to deal with. Now what if you have to deal with multiple test cases? No hecking problem. use subtests.

First, we change our `math.go` a bit

```go
// math.go
package math

func Add(a, b int) int {
	return a + b
}

func Subtract(a, b int) int {
	return a - b
}
```

I just added a `Subtract` function bruh why do you think i'd write some complex code for you? chill. calm. relax.

Now write subtests for this one like

```go
// math_test.go
package math

import (
	"testing"
)

func TestOperations(t *testing.T) {
	t.Run("Addition", func(t *testing.T) {
		if Add(1, 2) != 3 {
			t.Error("Addition is broken, help!")
		}
	})

	t.Run("Subtraction", func(t *testing.T) {
		if Subtract(5, 3) != 2 {
			t.Error("Subtraction is broken, send help!")
		}
	})
}
```

And that's it. Now we can run them and see what they show us.

`go test`

```txt
//
PASS
ok      testing-and-benchmarking     0.120s
```

`go test -v`

```txt
//
=== RUN   TestOperations
=== RUN   TestOperations/Addition
=== RUN   TestOperations/Subtraction
--- PASS: TestOperations (0.00s)
    --- PASS: TestOperations/Addition (0.00s)
    --- PASS: TestOperations/Subtraction (0.00s)
PASS
ok      testing-and-benchmarking     0.122s
```

and if you wish to run a single test function then you can use

```sh
go test -run TestOperations
```

See!? Simple, clean and organized plus now you're not drowning in an endless wall of test cases and writing tests is not that scary.

---

### Table-Driven Tests FTW!

If you're dealing with a bunch of test scenarios, you better get friendly with table-driven tests. They make you look like you actually care about writing clean code (which is a myth imo).

Anyways, Let's get coding!

```go
// math_test.go
package math

import (
	"testing"
)

func TestAddTableDriven(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive numbers", 1, 2, 3},
        {"zero values", 0, 0, 0},
        {"negative numbers", -1, -2, -3},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Expected %d, got %d", tt.expected, result)
            }
        })
    }
}
```

and you can run this simply with `go test -run TestAddTableDriven` and for the juicy stuff you can add `-v` with it. I love the juicy stuff so I'll use `-v` here.

`go test -run TestAddTableDriven -v`

```txt
//
=== RUN   TestAddTableDriven
=== RUN   TestAddTableDriven/positive_numbers
=== RUN   TestAddTableDriven/zero_values
=== RUN   TestAddTableDriven/negative_numbers
--- PASS: TestAddTableDriven (0.00s)
    --- PASS: TestAddTableDriven/positive_numbers (0.00s)
    --- PASS: TestAddTableDriven/zero_values (0.00s)
    --- PASS: TestAddTableDriven/negative_numbers (0.00s)
PASS
ok      go-testing-and-benchmarking     0.122s
```

Cool and clean stuff, right? Just run through all those scenarios without repeating yourself like a boring song on repeat.

**t.Parallel()**

This is useful when you have many tests that don't share state or make heavy use of I/O, like HTTP requests or database operations.

```go
// math_test.go
package math

import (
    "testing"
)

func TestAdd(t *testing.T) {
    t.Parallel() // run in parallel with other tests
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Expected 5, got %d", result)
    }
}

func TestOperations(t *testing.T) {
    t.Run("Addition", func(t *testing.T) {
        t.Parallel() // run this subtest in parallel
        if Add(1, 2) != 3 {
            t.Error("Addition is broken, help!")
        }
    })

    t.Run("Subtraction", func(t *testing.T) {
        t.Parallel() // run this subtest in parallel
        if Add(5, -3) != 2 {
            t.Error("Subtraction is broken, send help!")
        }
    })
}
```

And now if you run these tests using `go test -v` you get

```txt
//
=== RUN   TestAdd
=== PAUSE TestAdd
=== RUN   TestOperations
=== RUN   TestOperations/Addition
=== PAUSE TestOperations/Addition
=== RUN   TestOperations/Subtraction
=== PAUSE TestOperations/Subtraction
=== CONT  TestOperations/Addition
=== CONT  TestOperations/Subtraction
--- PASS: TestOperations (0.00s)
    --- PASS: TestOperations/Addition (0.00s)
    --- PASS: TestOperations/Subtraction (0.00s)
=== CONT  TestAdd
--- PASS: TestAdd (0.00s)
PASS
ok      testing-and-benchmarking     0.121s
```

which clearly shows that the tests were run in parallel.

> When using parallel tests, be careful about shared state. If your tests are modifying shared variables or state, you might run into data races. It's best to ensure that tests are independent of each other.

---

### Benchmarking like you care about PeRfOrMaNcE

Okay, now you've got your tests down. But what about performance? Do you care about it? Good if you do it. Now time to learn benchmarking like a proper developer who doesn't just shrug off performance issues.

**Basic Benchmark Example**

```go
// math_test.go
package math

import (
	"testing"
)

func BenchmarkAdd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		Add(1, 2)
	}
}
```

(yes we use `testin` package for benchmarking as well)

You can run this with `go test -bench=Add`

```txt
//
goos: windows
goarch: amd64
pkg: testing-and-benchmarking
cpu: Intel(R) Core(TM) i7-9700F CPU @ 3.00GHz
BenchmarkAdd-8          1000000000               0.2299 ns/op
PASS
ok      testing-and-benchmarking     0.381s
```

And that's how you see some nerdy benchmarks stats of your code. It spits out results like `ns/op` (nanoseconds per operation) because Go likes to remind you that performance is important, just like your mamma reminding you to do your homework :3

You can also check your code coverage by using `go test -cover`

```txt
//
PASS
coverage: 100.0% of statements
ok      testing-and-benchmarking     0.150s
```

---

### Profiling for the NERDS who want more.

Sometimes, benchmarks aren't enough and you want to go full nerd mode and profile your code. Lucky for you, Go has build-in tools for that too.

```sh
#
go test -bench=Add -cpuprofile=cpu.out
```

What to see what's hogging all the resources? Use:

```sh
#
go tool pprof cpu.out
```

Now you're not just finding performance bottlenecks, you're **OBLITERATING** them.

---

### Best practices for da Cool Kids

- **Table-Driven Tests:** Be efficient, not repetitive.
- **Parallel Tests:** `t.Parallel()` is your friend. Use it.
- **Benchmark Critical Parts:** Don't benchmark your toy functions; go for meaty stuff.
- **Mocks over Real Dependencies:** Keep it isolated, keep it fake.
- **Subtests for Grouping:** Keep it tidy. You're not writing spaghetti here.
- **Profile Before you Optimize:** Guesswork is for rookies. Profile your code and then optimize.

---

And that's it. Now you know how to write tests and benchmark your code. You can maybe try this out in your current or next Go project and also confidently say that you know how to write tests and benchmark your code in Go.
