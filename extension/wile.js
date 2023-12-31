
import { CID } from 'multiformats/cid';
import { dagCbor } from '@helia/dag-cbor';
import { createHelia } from './helia.js';

(async () => {
  // Setup
  const url = new URL(decodeURIComponent(document.location.hash.replace(/^#!url=/, '')));
  console.warn(`Loading ${url.href}…`);
  const cid = CID.parse(url.href.replace(/^web\+tile:\/\//, '').replace(/\/.*/, ''));
  console.warn(`CID=${cid.toString()}`);
  const helia = dagCbor(await createHelia());
  console.warn(`Helia created`);
  const manifest = await helia.get(cid);
  console.warn(`Manifest loaded`, manifest);

  // We have a manifest, let's get us some content
  document.title = manifest.name;
  const loader = document.querySelector('#loading');
  loader.style.display = 'none';
  const ifr = document.createElement('iframe');
  loader.after(ifr);
  // ifr.setAttribute('src', 'http://bafkreidgolmfbyf3pfv2zgp7s3gykuflbddh3rpk3bgs7aqacwsk4ahgru.ipfs.localhost:8080/');
  // ifr.setAttribute('src', 'test.txt');
  ifr.setAttribute('src', 'https://2017.im/');
})();
