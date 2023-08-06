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

### Operators

Here is a table of all the operators in Lupine and their respective precedence:

| Operators               |||||| Group          | Precedence |
|:---:|:----:|:--:|:--:|:-:|:-:|:--------------:|:----------:|
| =   |      |    |    |   |   | Assignment     | 1          |
| &&  | \|\| | ^^ | ?? |   |   | Boolean        | 2          |
| ==  | !=   | >= | <= | > | < | Comparison     | 3          |
| +   | -    |    |    |   |   | Addition       | 4          |
| *   | /    | %  | // |   |   | Multiplication | 5          |
| **  |      |    |    |   |   | Exponent       | 6          |
| &   | \|   | ^  |    |   |   | Bitwise        | 7          |
| >>  | <<   |    |    |   |   | Bitwise Shift  | 8          |
| ..  |      |    |    |   |   | Range          | 9          |
| ... | !    | -  | ~  |   |   | Unary          | 10         |
| .   | ?.   |    |    |   |   | Member         | 11         |

And here is what each operator does:
| Operator | Description                   |
|:--------:|:------------------------------|
| =        | Assigns a value to a variable |
| &&       | Boolean AND                   |
| \|\|     | Boolean OR                    |
| ^^       | Boolean XOR                   |
| !        | Boolean NOT                   |
| ??       | Nullish coalescing            |
| ==       | Equals                        |
| !=       | Does not equal                |
| >        | Greater than                  |
| >=       | Greater than or equal to      |
| <        | Less than                     |
| <=       | Less than or equal to         |
| +        | Addition                      |
| -        | Subtraction                   |
| *        | Multiplication                |
| /        | Division                      |
| %        | Modulus                       |
| //       | Integer divion                |
| **       | Exponent                      |
| &        | Bitwise AND                   |
| \|       | Bitwise OR                    |
| ^        | Bitwise XOR                   |
| ~        | Bitwise NOT                   |
| >>       | Bitwise left shift            |
| <<       | Bitwise right shift           |
| ?.       | Optional chaining             |
| .        | Member of                     |
| ..       | Range between two values      |
| ...      | Spread                        |

## Comments

Single line comments are preceeded by two hashtags (or pound signs, or octothorps, whatever you call them)
```lup
## Set grade to a C
let grade = 75;

value += 10; ## Add ten points to grade, making it a B
```

Multiline comments start with three hashtags and end with another three
```lup
### 
 #  This function takes two numbers and adds them together
 #  @param a number The first number to add
 #  @param b number The second number to add
 #  @returns number The sum of a and b
###
fn add(a, b) {
	return a + b;
}
```

## Visual Studio Code Support
I'm planning to develop a Lupine language extension for VS Code once the compiler is mostly stable, but for now that's sitting on the backburner.

