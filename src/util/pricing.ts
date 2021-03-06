import {
    Address,
    BigInt,
    BigDecimal,
    ethereum
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
    DAI_ADDRESS,
    DAYS_IN_YEAR,
    ZERO_BIG_DECIMAL
} from '../util/constants';
import { 
    integerToDecimal,
    secondsToDays
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
    geyser.lockedRewards = integerToDecimal(contract.totalLocked(), rewardToken.decimals);
    geyser.unlockedRewards = integerToDecimal(contract.totalUnlocked(), rewardToken.decimals);
    geyser.rewards = geyser.lockedRewards.plus(geyser.unlockedRewards);

    // USD amounts
    geyser.stakedUSD = geyser.staked.times(stakingToken.price);
    geyser.rewardsUSD = geyser.rewards.times(rewardToken.price);

    geyser.tvl = geyser.stakedUSD.plus(geyser.rewardsUSD);

    let accounting = contract.try_updateAccounting();
    let globalStakingSharesSeconds: BigDecimal;
    if (!accounting.reverted) {
      globalStakingSharesSeconds = integerToDecimal(accounting.value.value3);
    }
    
    geyser.globalSharesSec = globalStakingSharesSeconds;

    let secondsSinceCreation: BigInt = block.timestamp.minus(geyser.createdTimestamp);
    let daysSinceCreation = secondsToDays(secondsSinceCreation);

    let calculatedAPR = ZERO_BIG_DECIMAL;
    if (geyser.staked.notEqual(ZERO_BIG_DECIMAL)) {
        calculatedAPR = geyser.unlockedRewards.div(geyser.staked).times(DAYS_IN_YEAR.div(daysSinceCreation)).times(BigDecimal.fromString('100'));
    }

    geyser.apr = calculatedAPR;

    geyser.save();
    stakingToken.save();
    rewardToken.save();
}