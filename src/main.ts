import { tokenize } from "./lexer";
import * as fs from "node:fs";



let contents = fs.readFileSync("./test.lup").toString();
console.dir(tokenize(contents));
