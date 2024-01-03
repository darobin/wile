
import { createHelia } from 'helia';
import { dagCbor } from '@helia/dag-cbor';
import { CID } from 'multiformats/cid';

let helia;

window.addEventListener('DOMContentLoaded', async () => {
  const url = new URL(decodeURIComponent(document.location.hash.replace(/^#!url=/, '')));
  console.warn(`Loading ${url.href}…`);
  const cid = CID.parse(url.href.replace(/^web\+tile:\/\//, '').replace(/\/.*/, ''));
  console.warn(`CID=${cid.toString()}`);
  const node = await createHelia();
  helia = dagCbor(node);
  console.warn(`Helia created`, helia);
  const cbor = await helia.get(cid);
  console.warn(cbor);
});
