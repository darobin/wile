
import { createHelia } from 'helia';
import { dagCbor } from '@helia/dag-cbor';


export default class Mosaist {
  createTileServer (manifest) {
    return new MosaistTileServer(manifest);
  }
}

class MosaistTileServer {
  constructor (manifest) {
    this.manifest = manifest;
  }
  async serve () {
    this.helia = await createHelia();
    this.dagCbor = dagCbor(this.helia);
    const rootAddr = this.dagCbor.add(this.manifest);
    console.warn(`serving web+tile://${rootAddr}/`);
    return rootAddr;
  }
}
