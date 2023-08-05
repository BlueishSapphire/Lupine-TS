import * as fs from "node:fs";
import { tokenize } from "./lexer";
import { Parser } from "./parser";



const targetFileName = process.argv[2];
const contents = fs.readFileSync(targetFileName).toString();
const tokens = tokenize(contents);

const parser = new Parser(tokens);
const program = parser.parse();
