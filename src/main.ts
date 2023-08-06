import * as fs from "node:fs";
import { tokenize } from "./lexer";
import { parse } from "./parser";



const targetFileName = process.argv[2];
if (targetFileName === undefined || targetFileName.length === 0) {
	console.log("Please run this command with the filename of the script you want to compile");
	process.exit(1);
}

const contents = fs.readFileSync(targetFileName).toString();
const tokens = tokenize(contents);
const program = parse(tokens);
