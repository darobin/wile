
import { isAbsolute, join } from 'node:path';
import { cwd } from 'node:process';
import { readFile, readdir } from 'node:fs/promises';
import mime from 'mime-types';
import { createHelia } from 'helia';
import { dagCbor } from '@helia/dag-cbor';
import { raw } from './helia-raw.js';

export default class Mosaist {
  async watchDirectory (maybeRelPath) {
    const s = new MosaistTileServer();
    await s.start();
    if (!isAbsolute(maybeRelPath)) maybeRelPath = join(cwd(), maybeRelPath);
    const files = (await readdir(maybeRelPath, { recursive: true }))
      .map((f) => ({ relPath: f, fullPath: join(maybeRelPath, f) }))
    ;
    const manEntry = files.find(({ relPath }) => relPath === 'manifest.json');
    if (!manEntry) throw new Error(`No manifest.json at root of tile directory "${maybeRelPath}"`);
    await s.setManifestFromPath(manEntry.fullPath);
    const otherFiles = files.filter(({ relPath }) => relPath !== 'manifest.json');
    await Promise.all(
      otherFiles.map(({ relPath, fullPath }) => s.addFileFromPath(relPath, fullPath))
    );
    const rootAddr = await s.serveLatest();
    console.warn(`serving web+tile://${rootAddr}/`);
    // XXX do the watch part too
    // - watch
    //  - on add or change
    //    - manifest: process & serve (if error, error)
    //    - other: add, update map + manifest, serve
    //  - on delete
    //    - manifest: error
    //    - other: remove, update map + manifest, serve
    return s;
  }
}

class MosaistTileServer {
  constructor () {
    this.helia = null;
    this.dagCbor = null;
    this.manifest = { name: 'Untitled', description: '' };
  }
  async start () {
    this.helia = await createHelia({ start: true });
    this.dagCbor = dagCbor(this.helia);
    this.raw = raw(this.helia);
    console.warn(`Mosaist server started…`);
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
    const cid = await this.raw.add(await readFile(fullPath));
    const src = cid.toString();
    if (!this.manifest.resources) this.manifest.resources = {};
    this.manifest.resources[relPath] = { src, mediaType };
    if (relPath === 'index.html') this.manifest.resources['/'] = { src, mediaType };
  }
  async serveLatest () {
    const rootAddr = await this.dagCbor.add(this.manifest);
    return rootAddr;
  }
}
