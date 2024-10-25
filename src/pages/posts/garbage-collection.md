---
layout: "../../layouts/PostLayout.astro"
title: "Garbage Collection in Go"
desc: "Guess we need to dig deeper and collect some garbage, eh?"
date: "2024-10-25"
author: "redacted"
---

Aight, zoomers and boomers (i wonder is boomers read my posts...) anyways. Today we are learning about **Garbage Collection**. I'm not talking about the kind of stuff you toss out every week. I'm talking about the magik that happens in programming to keep our memory tidy and efficient. If you've ever written a program (I'm not talking about your "Hello, World!" in HTML), you've likely created and discarded a lot of objects. But what happens to those objects when they're no longer needed? And my child that's where garbage collections comes in.

Garbage Collection is like having a personal cleaning crew for your computer's memory. When you allocate memory for an object, the system is like a landlord giving you a cozy little spot. But as soon as you're done with that object, you don't want to pay rent anymore, right? This is where garbage collection comes in to reclaim that space. It's like the garbage collector making rounds to clear out what you no longer need, freeing up memory for the next big thing.

### How Does it Work???

Garbage Collection generally works in a few different ways, but I being a good boy will tell you about the most common method: **mark-and-sweet**. Imagine you're throwing a party (you wish you had invited some girl, huh?) (FOCUS!!) and want to find out which of your friends have left. You go around marking all your friends who are still there (the ones you still need ofc) and, once you've checked everyone, you just sweep up the leftovers and those who are no longer around (the unreachable objects).

Well, I'm just gonna be honest here I hate too much theory so let's get coding 'cause we love hitting those keys and make things work (you deserve a yeet if you don't)

```go
//
package main

import "fmt"

type Person struct {
	Name string
}

func main() {
	meowflower := &Person{Name: "MeowFlower"}

	fmt.Printf("Greetings, %s", meowflower.Name)

	// well here we are done with using meowflower
	// if there are no other references to it, it becomes garbage
	// so we'll let go of him by setting the value of nil

	meowflower = nil // letting go... say goodbye to meowflower :c

	// now meowflower is ready for garbage collection

	// here we try to simulate a function that might create garbage
	CreateGarbage()
}

func CreateGarbage() {
	for i := 0; i < 1000; i++ {
		_ = &Person{Name: fmt.Sprintf("Person: %d", i)}
	}

	// after this function exits
	// all Person objects created here become garbage
}
```

**Output**

```txt
//
❯ go run .\main.go
Greetings, MeowFlower
```

Okay so after `CreateGarbage` is called, all those `Person` objects created in the loop become eligible for garbage collection because there are no more references to them. The Go runtime will eventually sweep through memory, identify these unreachable objects, and reclaim the memory.

> Ohhh... but akshually SYK you are just talking buzzwords here where are the fun lores!!?? SHUT UP

Yes so what exactly happened when we processed that code?? Now we talk about

### The Mark-and-Sweep Process

Look, mark-and-sweep is backbone of many garbage collection implementations.

1. **Marking**: When the garbage collector kicks in, it starts at a set of root references (like global variables, local variables on the stack, and CPU registers) and marks all the objects that are reachable. It's like a detective looking for clues. If it can trace a path to an object, that object stays marked.
2. **Sweeping**: After marking, the collector sweets through the heap (where all the dynamic memory is allocated) and removes all unmarked objects. These are the ones nobody is interested in anymore (just like you. nah I'm just kidding. **ily :3**), and they can be safely deleted.

If you are still too braindead to understand this then here's something better for you.

Imagine a library where some books are checked out (marked) while others are gathering dust on the shelves (unmarked). At the end of the day, the librarian clears out the books that aren't checked out, making room for new arrivals.

(still don't get it!!?? get some help and use some LLM maybe)
(or you can read the entire thing @ [GC GUIDE](https://tip.golang.org/doc/gc-guide))

---

While garbage collection is fantastic for taking the load off your shoulders (not irl load sadly), it's not without its trade-offs. One of the biggest concerns is **performance**. Sometimes, garbage collection can kick in at unexpected moments, leading to what we call "stop-the-world" pauses. Imagine you're mid-game, and suddenly your system decides it's time to clean up. I can already imagine you raging and smacking your keyboard straight into your monitor. _there, there._

However, modern garbage collectors have come a long way. They're more sophisticated and can do most of their work without causing significant pauses. For instance, the **generational garbage collection** technique takes advantage of the observation that most objects die young (they've created and quickly become unreferenced). By separating objects into different generations based on their lifespan, the collector can focus on younger generations more frequently while sweeping through older generations less often.

---

### How to deal with Garbage Collection then??

Well we can't directly control when garbage collection happens, we can certainly write our code to play nice with it (just how (s)he did. haha). Here are a few tips for you lovely gophers (or just normal human beings in case you ever happen to work with Golang)

1. **Minimize Object Allocation**: Try to reuse objects where possible. For example, instead of creating new objects in a loop, you could maintain a pool of reusable objects. This not only reduces garbage but also saves on allocation time.
2. **Avoid Global Variables**: They can hold onto references longer than necessary, preventing objects for being collected. If you don't need a global variable, don't declare one!
3. **Profile Your Application**: Use tools to analyze memory usage and understand how garbage collection is impacting your performance. You can use Go's build-in profiling tools that can help you what's going on under the hood.
   ( [Testing and Benchmarking in GO](https://0x-kys.github.io/posts/testing-n-benchmarking/) )

Now lemme show you how we can enhance the code we wrote before and how object pooling can reduce garbage collection overhead.

```go
//
package main

import (
	"fmt"
	"sync"
)

type Object struct {
	Name string
}

var pool = sync.Pool{
	New: func() interface{} {
		return &Object{}
	},
}

func main() {
	// get object from the pool
	obj := pool.Get().(*Object)
	obj.Name = "Pooled Object"``
	fmt.Println("Created:", obj.Name)

	// make use of object
	UseObject(obj)

	// after playing around put it back into the pool
	pool.Put(obj)

	// and we can reuse it again
	newObj := pool.Get().(*Object)
	fmt.Println("Reused:", newObj.Name) // should still have default values
}

func UseObject(obj *Object) {
	fmt.Println("Using:", obj.Name)
}
```

**Output**

```txt
//
❯ go run .\main.go
Created: Pooled Object
Using: Pooled Object
Reused: Pooled Object
```

Here we used `sync.Pool` to manage our `Object` instances. This way, we reduce the number of allocations, which means less garbage for our collection to clean up. Plus, when we reuse objects, we're not just being memory-efficient, we're also boosting performance by avoiding costly memory allocations.

---

### Myth Buster Content!!

One of the biggest misconceptions about Garbage Collection is that it makes memory management unnecessary. While garbage collection automates memory management, it's not a silver bullet. You still need to be mindful of how you structure your code and manage object references.

Some say Garbage Collection is slow, well, it can introduce pauses, modern garbage collectors have been optimized for performance. Languages like Go and Java have made significant strides in developing collectors that minimize interruptions and give a smoother performance in real-world applications.

(don't be shocked about me talking about Java)
(it's just fun to learn about stuff)

---

### Bonus Reading

If you wish to learn about garbage collection methods other than **Mark-and-Sweep** then here are some you can google.

- Reference Counting
- Copy Collection
- Generational Garbage Collection
- Tracing Collection
- Concurrent and Incremental Collection

And if you are a no-lifer who'd like to know more then you should defo check out [GC GUIDE](https://tip.golang.org/doc/gc-guide)
