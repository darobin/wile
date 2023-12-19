
import { createHelia } from 'helia';
import { dagCbor } from '@helia/dag-cbor';
import { bootstrap } from '@libp2p/bootstrap'
import { tcp } from '@libp2p/tcp';
import { MemoryBlockstore } from 'blockstore-core';
import { MemoryDatastore } from 'datastore-core';
import { createLibp2p } from 'libp2p';
import { identify } from '@libp2p/identify';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';

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
    const blockstore = new MemoryBlockstore();
    const datastore = new MemoryDatastore();
    const libp2p = await p2p(datastore);
    this.helia = await createHelia({
      datastore,
      blockstore,
      libp2p,
    });
    this.dagCbor = dagCbor(this.helia);
    const rootAddr = await this.dagCbor.add(this.manifest);
    console.warn(`serving web+tile://${rootAddr}/`);
    return rootAddr;
  }
}

async function p2p (datastore) {
  return await createLibp2p({
    datastore,
    addresses: {
      listen: ['/ip4/127.0.0.1/tcp/0'],
    },
    transports: [tcp()],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    peerDiscovery: [
      bootstrap({
        list: [
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
        ],
      }),
    ],
    services: {
      identify: identify(),
    },
  });
}
