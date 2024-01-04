
import { CID } from 'multiformats/cid';
import * as rawCodec from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';

class Raw {
  constructor (helia) {
    this.helia = helia;
  }
  async add (bytes, options = {}) {
    const hash = await (options.hasher ?? sha256).digest(bytes);
    const codec = options.codec ?? rawCodec;
    const cid = CID.createV1(codec.code, hash);
    await this.helia.blockstore.put(cid, bytes, options);
    return cid;
  }
  async get (cid, options = {}) {
    return await this.helia.blockstore.get(cid, options);
  }
}

export function raw (helia) {
  return new Raw(helia);
}
