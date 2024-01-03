
import { isAbsolute, join } from 'node:path';
import { cwd } from 'node:process';
import { readFile, readdir } from 'node:fs/promises';
import { createHelia } from 'helia';
import { dagCbor } from '@helia/dag-cbor';
import mime from 'mime-types';

export default class Mosaist {
  async watchDirectory (maybeRelPath) {
    const s = new MosaistTileServer();
    await s.start();
    if (!isAbsolute(maybeRelPath)) maybeRelPath = join(cwd(), maybeRelPath);
    const files = await readdir(maybeRelPath, { recursive: true })
      .map((f) => ({ relPath: f, fullPath: join(maybeRelPath, f) }))
    ;
    console.warn(JSON.stringify(files, null, 2));
    const manEntry = files.find(({ relPath }) => relPath === 'manifest.json');
    if (!manEntry) throw new Error(`No manifest.json at root of tile directory "${maybeRelPath}"`);
    await s.setManifestFromPath(manEntry);
    const otherFiles = files.filter(({ relPath }) => relPath !== 'manifest.json');
    await Promise.all(
      otherFiles.map(({ relPath, fullPath }) => s.addFileFromPath(relPath, fullPath))
    );
    // - add each file and include it in the map
    // - set map on manifest template
    // - encode manifest & serve
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
    // XXX HOW TO ADD RAW? - add, like, the bytes and get a CID
    if (!this.manifest.resources) this.manifest.resources = {};
    this.manifest.resources[relPath] = { src, mediaType };
    if (relPath === 'index.html') this.manifest.resources['/'] = { src, mediaType };
  }
  async serveLatest () {
    const rootAddr = await this.dagCbor.add(this.manifest);
    console.warn(`serving web+tile://${rootAddr}/`);
    return rootAddr;
  }
}
