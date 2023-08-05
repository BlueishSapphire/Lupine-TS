import { tokenize } from "./lexer";
import * as fs from "node:fs";
import { Parser } from "./parser";



const contents = fs.readFileSync("./test.lup").toString();
const tokens = tokenize(contents);

const parser = new Parser(tokens);
const ast = parser.parse();
