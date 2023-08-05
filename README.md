# Lupine-TS

A compiler for the Lupine programming language written in TypeScript.

## Lupine

Lupine is a language that transpiles to Lua for the time being, with plans to compile to Lua bytecode in the future. Its syntax loosely resembles that of other languages, mainly Rust and TypeScript.

Some example Lupine scripts are included in the `examples/` directory. Here is an example of a program written in Lupine that outputs the first 10 Fibonacci numbers:
```lup
## fibonacci.lup

let a = 0;
let b = 1;

for i -> 1..10 {
	let temp = b;
	b = a + b;
	a = temp;
	println(b);
}
```



## Visual Studio Code Support
I'm planning to develop a Lupine language extension for VS Code once the compiler is mostly stable, but for now that's sitting on the backburner.

