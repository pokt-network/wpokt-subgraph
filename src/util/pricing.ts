import {
    Address,
    BigInt,
    ethereum,
    log
  } from '@graphprotocol/graph-ts';
import {
    TokenGeyser as TokenGeyserContract,
} from '../types/TokenGeyser/TokenGeyser';
import {
    TokenGeyser,
    Token
} from '../types/schema';
import { BPool } from '../types/TokenGeyser/BPool'
import { 
    WPOKT_DAI_BPOOL, 
    WPOKT_ADDRESS, 
    DAI_ADDRESS
} from '../util/constants';
import { 
    integerToDecimal
} from '../util/helper';

export function getBalancerWPOKTSpotPrice(): BigInt {
    let bpool = BPool.bind(Address.fromString(WPOKT_DAI_BPOOL));
    
    let wPOKT = Address.fromString(WPOKT_ADDRESS);
    let DAI = Address.fromString(DAI_ADDRESS);

    let spotPrice: BigInt;
    let spotPriceCall = bpool.try_getSpotPrice(DAI, wPOKT);
    if (!spotPriceCall.reverted) {
        spotPrice = spotPriceCall.value;
    }

    return spotPrice;
}

export function updatePrices(
    geyser: TokenGeyser,
    contract: TokenGeyserContract,
    stakingToken: Token,
    rewardToken: Token,
    block: ethereum.Block
    ): void {
    
    // Update pricing
    stakingToken.price = integerToDecimal(getBalancerWPOKTSpotPrice());
    stakingToken.updated = block.timestamp;
    rewardToken.price = integerToDecimal(getBalancerWPOKTSpotPrice());
    rewardToken.updated = block.timestamp;

    // Farm stats
    geyser.staked = integerToDecimal(contract.totalStaked(), stakingToken.decimals);
    geyser.rewards = integerToDecimal(contract.totalLocked(), rewardToken.decimals).plus(
        integerToDecimal(contract.totalUnlocked(), rewardToken.decimals)
    );

    // USD amounts
    geyser.stakedUSD = geyser.staked.times(stakingToken.price);
    geyser.rewardsUSD = geyser.rewards.times(rewardToken.price);

    let accounting = contract.try_updateAccounting();
    if (!accounting.reverted) {
      log.info('global share sec: {}', [accounting.value.value3.toString()]);
    }

    geyser.save();
    stakingToken.save();
    rewardToken.save();
}