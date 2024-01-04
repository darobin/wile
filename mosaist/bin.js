#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { exit } from "node:process";
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
  .command('publish')
  .description('publish a tile')
  .argument('<path>', 'path to the tile directory')
  .action(async (pth) => {
    const m = new Mosaist();
    await m.publishDirectory(pth);
  })
;

program
  .command('manifest')
  .description('load and print the manifest for a URL')
  .argument('<URL>', 'URL to a tile')
  .action(async (url) => {
    const m = new Mosaist();
    const manifest = await m.fetchManifest(url);
    console.log(JSON.stringify(manifest, null, 2));
    exit(0);
  })
;

program.parse();
