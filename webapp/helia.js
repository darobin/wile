
import { createHelia as realCreateHelia } from 'helia';
import { trustlessGateway } from 'helia/block-brokers';
import { IDBDatastore } from 'datastore-idb';
import { IDBBlockstore } from 'blockstore-idb';

let helia;

export async function createHelia () {
  if (helia) return helia;
  const datastore = new IDBDatastore('helia/datastore');
  await datastore.open();
  const blockstore = new IDBBlockstore('helia/blockstore');
  await blockstore.open();
  // more open version: 
  // await createHelia({ datastore, blockstore, libp2p: { connectionManager: { minConnections: 0 }}});
  // from https://github.com/2color/ipfs-signer/blob/main/src/utils/ipfs.tsx#L9
  helia = await realCreateHelia({
    blockBrokers: [
      trustlessGateway({
        gateways: ['http://localhost:8080/', 'https://dweb.link', 'https://cf-ipfs.com'],
      }),
    ],
    libp2p: {
      start: false,
      connectionManager: {
        minConnections: 0,
      },
      services: {},
      peerDiscovery: [],
    },
  });
  await helia.libp2p.stop();
  return helia;
}
