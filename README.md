<div align="center">
  <a href="https://www.pokt.network">
    <img src="https://user-images.githubusercontent.com/16605170/74199287-94f17680-4c18-11ea-9de2-b094fab91431.png" alt="Pocket Network logo" width="340"/>
  </a>
</div>

# wPOKT Subgraph
[![Rinkeby CI/CD](https://github.com/pokt-network/wpokt-subgraph/actions/workflows/testnet.yaml/badge.svg)](https://github.com/pokt-network/wpokt-subgraph/actions/workflows/testnet.yaml)

A subgraph that indexes wPOKT staking contract.
<div>
</div>

## Overview

<div>
    <a  href="https://github.com/pokt-network/wpokt-subgraph/pulse"><img src="https://img.shields.io/github/contributors/pokt-network/pocket-core.svg"/></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg"/></a>
    <a href="https://github.com/pokt-network/wpokt-subgraph/pulls"><img src="https://img.shields.io/github/issues-pr/pokt-network/pocket-core.svg"/></a>
    <a href="https://github.com/pokt-network/wpokt-subgraph/issues"><img src="https://img.shields.io/github/issues-closed/pokt-network/pocket-core.svg"/></a>
</div>


The Pocket Network staking contracts are in charge of distributing rewards to users that stake wPOKT, this subgraph indexes all the operations made in and out by this staking contract to keep the wPOKT farming app updated.

## Getting Started

These are the contracts being tracked on testnet for the subgraph.

```
wPOKT on Rinkeby - 0x2f363dd061cc8b3411c3c91c0cfac0fa1b62f656
TokenGeyser on Rinkeby - 0xdb7d0a3bfcb7b34e6be510b26c55c8b60bd66d4a
wPOKT Pool - 0x7c2cf434e98940ad08ae3f26986235628b0904e7
```

### Installation

1. Clone this github repository

2. `yarn install`
3. `yarn codegen`
4. `yarn build`
5. `yarn deploy $GRAPH_TOKEN $SUBGRAPH_NAME`

## Documentation

The documentation on how to query this subgraph can be found at thegraph.com/docs/.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/pokt-network/repo-template/blob/master/CONTRIBUTING.md) for details on contributions and the process of submitting pull requests.

## Support & Contact

<div>
  <a  href="https://twitter.com/poktnetwork" ><img src="https://img.shields.io/twitter/url/http/shields.io.svg?style=social"></a>
  <a href="https://t.me/POKTnetwork"><img src="https://img.shields.io/badge/Telegram-blue.svg"></a>
  <a href="https://www.facebook.com/POKTnetwork" ><img src="https://img.shields.io/badge/Facebook-red.svg"></a>
  <a href="https://research.pokt.network"><img src="https://img.shields.io/discourse/https/research.pokt.network/posts.svg"></a>
</div>


## License

This project is licensed under the MIT License; see the [LICENSE.md](LICENSE.md) file for details.