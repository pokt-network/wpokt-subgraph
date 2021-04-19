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
wPOKT: 0x362067F3833a232786354e1366b0d3797583C7E1
TokenGeyser: 0xC32eB16f016b193966caC6980F5EB25d498E8DC9
Unlocked wPOKT Pool: 0x39b79EF73F25413BBA2624f818eA924b74B83EBF
Locked wPOKT Pool: 0x5368e433d65E2De1188dC0B9a0B9a74e7DD1AC3A
```

### Installation

1. Clone this github repository

2. `yarn install`
3. `yarn codegen`
4. `yarn build`
5. `yarn deploy $GRAPH_TOKEN $SUBGRAPH_NAME`

## Documentation

The documentation on how to query this subgraph can be found at thegraph.com/docs/.

# wPOKT (Subgraph)

Subgraph code: https://github.com/pokt-network/wpokt-subgraph

The subgraph is saving four entities:
- Token
- TokenGeyser (aka Farm)
- User
- Stake

We are listening to several events in the TokenGeyser contract, and the purpose of this document is to explain how these are being tracked/saved.

In the repository, we have a single mapping file for all the events related to the TokenGeyser. Since we are not using a Factory to deploy the Geysers, we need to specify the contract addresses in the `subgraph.yaml` using multiple data sources.

**Considerations:** 

1. The `handleBlock` function in the mapping uses an array of addresses called `trackedGeysers`. 

    **Why?**
    Since the event itself isn't triggered by the contract, then we need to store the       geysers it needs to periodically update. If we used a Factory to deploy the Farms, then     we could do this in a better way.
    
2. The `startBlock` parameter in `subgraph.yaml` should be the block when `lockTokens()` was first called.

    **Why?**
    Since we are not using a Factory to deploy the contracts, there's no way to listen to an     event when each contract is created to save `TokenGeyser` identities. So, we decided to create the `TokenGeyser` identity after locking tokens for rewards (calling `lockTokens`). [See here. ](https://github.com/pokt-network/wpokt-subgraph/blob/master/src/mappings/tokenGeyser.ts#L160)
    
    This is a disadvantage in a certain way, since farms **must** only have 1 unlock schedule for this subgraph to work correctly. In the future, I would suggest using a Factory to avoid these workarounds.
    
3. The subgraph updates the `TokenGeyser` stats (APR, TVL, etc) & `Token` prices periodically. After someone stakes, unstakes and after each block number with the following requirement: `(BlockNumber % 100 == 0)`. Ideally, this could happen more often for quicker updates.

4. Since wPOKT will be launched using a Balancer Pool, its price is fetched calling the BPool contract to get the Spot price. [See here.](https://github.com/pokt-network/wpokt-subgraph/blob/master/src/util/pricing.ts#L26).

    The Balancer Pool contract address, the wPOKT address and DAI address (assuming a wPOKT/DAI Pool) is set in the constants. [See here.](https://github.com/pokt-network/wpokt-subgraph/blob/master/src/util/constants.ts#L19)
    
5. The APR formula can be found [here.](https://github.com/pokt-network/wpokt-subgraph/blob/master/src/util/pricing.ts#L78)

    `[(Unlocked Rewards / Staked) * (365.25 / DAYS_SINCE_FARM_CREATION)] * 100`



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
