
import { isAbsolute, join } from 'node:path';
import { cwd } from 'node:process';
import { readFile, readdir } from 'node:fs/promises';
import mime from 'mime-types';
import { CID } from 'multiformats/cid';
import { create } from "kubo-rpc-client";

const ipfs = create();

export default class Mosaist {
  async watchDirectory (maybeRelPath) {
    const m = new MosaistManifestManager();
    if (!isAbsolute(maybeRelPath)) maybeRelPath = join(cwd(), maybeRelPath);
    const files = (await readdir(maybeRelPath, { recursive: true }))
      .map((f) => ({ relPath: f, fullPath: join(maybeRelPath, f) }))
    ;
    const manEntry = files.find(({ relPath }) => relPath === 'manifest.json');
    if (!manEntry) throw new Error(`No manifest.json at root of tile directory "${maybeRelPath}"`);
    await m.setManifestFromPath(manEntry.fullPath);
    const otherFiles = files.filter(({ relPath }) => relPath !== 'manifest.json');
    await Promise.all(
      otherFiles.map(({ relPath, fullPath }) => m.addFileFromPath(relPath, fullPath))
    );
    const rootAddr = await m.addLatest();
    console.warn(`serving web+tile://${rootAddr}/`);
    // XXX do the watch part too
    // - watch
    //  - on add or change
    //    - manifest: process & serve (if error, error)
    //    - other: add, update map + manifest, serve
    //  - on delete
    //    - manifest: error
    //    - other: remove, update map + manifest, serve
  }
  async fetchManifest (url) {
    const cid = new URL(url).hostname;
    return await getDAG(CID.parse(cid));
  }
}

class MosaistManifestManager {
  constructor () {
    this.manifest = { name: 'Untitled', description: '' };
  }
  setManifest (manifest) {
    this.manifest = manifest;
  }
  async setManifestFromPath (pth) {
    this.setManifest(await this.loadManifest(pth));
  }
  async loadManifest (pth) {
    return JSON.parse(await readFile(pth));
  }
  async addFileFromPath (relPath, fullPath) {
    const mediaType = mime.lookup(fullPath);
    const cid = await addRaw(await readFile(fullPath));
    const src = cid.toString();
    if (!this.manifest.resources) this.manifest.resources = {};
    this.manifest.resources[relPath] = { src, mediaType };
    if (relPath === 'index.html') this.manifest.resources['/'] = { src, mediaType };
  }
  async addLatest () {
    const rootAddr = await addDAG(this.manifest);
    return rootAddr;
  }
}

async function addDAG (dag) {
  return await ipfs.dag.put(dag);
}

async function getDAG (cid) {
  const { value } = await ipfs.dag.get(cid);
  return value;
}

// this probably doesn't chunk for now we don't care
async function addRaw (bytes) {
  const cid = await ipfs.block.put(bytes, { version: 1, format: 'raw', pin: true });
  return cid;
}

// async function getRaw (cid) {
//   return await ipfs.block.get(cid);
// }
