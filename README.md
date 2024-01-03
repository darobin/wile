
# wile

Extension to play with Web Tiles

## Todo

- [x] Basic manifest
- [x] Basic logo
- [x] Register web+tile protocol
- [x] Test render for that (web+tile://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/)
- [ ] Create and serve complete tile with dependencies
  - [ ] Get all dependencies, add them, get path and CID
  - [ ] Get manifest template
  - [ ] Generate full tile and serve that
- [ ] Render tile on the client
  - [x] Load DAG-CBOR manifest client side 
  - [ ] Set manifest up as a map to a local server
  - [ ] Create SW to intercept webRequests, resolve them against the manifest, and serve them
