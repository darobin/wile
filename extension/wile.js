
import { createHelia } from 'helia';
import { dagCbor } from '@helia/dag-cbor';
import { CID } from 'multiformats/cid';
import { IDBDatastore } from 'datastore-idb';
import { IDBBlockstore } from 'blockstore-idb';

let helia;

(async () => {
  // Setup
  const datastore = new IDBDatastore('helia/datastore');
  await datastore.open();
  const blockstore = new IDBBlockstore('helia/blockstore');
  await blockstore.open();
  const url = new URL(decodeURIComponent(document.location.hash.replace(/^#!url=/, '')));
  console.warn(`Loading ${url.href}…`);
  const cid = CID.parse(url.href.replace(/^web\+tile:\/\//, '').replace(/\/.*/, ''));
  console.warn(`CID=${cid.toString()}`);
  const node = await createHelia({ datastore, blockstore, libp2p: { connectionManager: { minConnections: 0 }}});
  helia = dagCbor(node);
  console.warn(`Helia created`);
  const manifest = await helia.get(cid);
  console.warn(`Manifest loaded`, manifest);

  // We have a manifest, let's get us some content
  document.title = manifest.name;
  const loader = document.querySelector('#loading');
  loader.style.display = 'none';
  const ifr = document.createElement('iframe');
  loader.after(ifr);
})();
