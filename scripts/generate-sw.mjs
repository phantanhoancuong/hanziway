import { readFileSync, writeFileSync } from "fs";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));
const template = readFileSync("./public/sw.template.js", "utf-8");
const output = template.replace("__CACHE_VERSION__", version);

writeFileSync("./public/sw.js", output);
