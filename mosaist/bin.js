#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { program } from "commander";
import Mosaist from "./index.js";
import makeRel from "./rel.js";

const rel = makeRel(import.meta.url);
const { name, version, description } = JSON.parse(await readFile(rel('package.json')));

program
  .name(name)
  .version(version)
  .description(description)
;

program
  .command('serve')
  .description('serve a tile')
  .argument('<path>', 'path to the tile directory')
  .action(async (pth) => {
    const m = new Mosaist();
    await m.watchDirectory(pth);
  })
;

program.parse();
