
import { createHelia } from 'helia';
import { dagCbor } from '@helia/dag-cbor';

export default class Mosaist {
  async watchDirectory (maybeRelPath) {
    const s = new MosaistTileServer();
    // - make path absolute
    // - get all files
    // - set manifest template
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
  }
  async start () {
    this.helia = await createHelia({ start: true });
    this.dagCbor = dagCbor(this.helia);
    console.warn(`Mosaist server started…`);
  }
  async serveManifest (manifest) {
    const rootAddr = await this.dagCbor.add(manifest);
    console.warn(`serving web+tile://${rootAddr}/`);
    return rootAddr;
  }
}
