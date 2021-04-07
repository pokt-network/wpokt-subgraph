import {
  Staked,
  Unstaked,
  TokensClaimed,
  TokensLocked,
  TokensUnlocked,
  TokenGeyser as TokenGeyserContract,
} from '../types/TokenGeyser/TokenGeyser';
import {
  TokenGeyser,
  Token,
  User,
  Stake,
} from '../types/schema';
import {
  ZERO_BIG_INT,
  ZERO_BIG_DECIMAL,
  ONE_BIG_INT,
} from '../util/constants';
import { Address, BigInt, BigDecimal, log, ethereum } from '@graphprotocol/graph-ts';
import { createNewToken, integerToDecimal } from '../util/helper';
import { updatePrices } from '../util/pricing';

let trackedGeysers: string[] = [
  '0xa021bb8900e905dd4c39a00ee2e8882e95f5d242' // Genesis Farm (wPOKT/wPOKT)
];

export function handleStaked(event: Staked): void {
  // Load the TokenGeyser instance from db.
  let geyser = TokenGeyser.load(event.address.toHexString())!;
  let contract = TokenGeyserContract.bind(event.address);

  // Load staking token & reward token from db.
  let stakingToken = Token.load(geyser.stakingToken)!;
  let rewardToken = Token.load(geyser.rewardToken)!;

  // Create a new user if it doesn't exist already.
  let user = User.load(event.params.user.toHexString());

  if (user === null) {
    user = new User(event.params.user.toHexString());
    user.operations = ZERO_BIG_INT;
    user.earned = ZERO_BIG_DECIMAL;
  }

  // Create a new stake with the specified amount
  let stakeId = user.id + '-' + event.block.timestamp.toString();

  let stakedAmount = integerToDecimal(event.params.amount);

  let stake = new Stake(stakeId);
  stake.amount = stakedAmount;
  stake.user = user.id;
  stake.timestamp = event.block.timestamp;
  
  // Add the created stake to the user
  user.stakes = user.stakes.concat([stake.id]);
  user.totalStaked = integerToDecimal(event.params.total);

  let totalStaked = integerToDecimal(contract.totalStaked());
  let totalStakingShares = integerToDecimal(contract.totalStakingShares());
  let stakingShares = totalStakingShares.times(stakedAmount).div(totalStaked);
  stake.shares = stakingShares;

  // Update stats information
  user.operations = user.operations.plus(ONE_BIG_INT);
  geyser.operations = geyser.operations.plus(ONE_BIG_INT);
  geyser.updated = event.block.timestamp;

  // Save entities in the dabase.
  user.save();
  stakingToken.save();
  rewardToken.save();
  stake.save();
  geyser.save();
}

export function handleUnstaked(event: Unstaked): void {
  // Load the TokenGeyser instance.
  let geyser = TokenGeyser.load(event.address.toHexString())!;
  let contract = TokenGeyserContract.bind(event.address);

  // Load existing user.
  let user = User.load(event.params.user.toHexString())!;

  // Load stakes from user.
  let stakes = user.stakes!;
  let unstakedAmount = integerToDecimal(event.params.amount);

  let deducted: boolean = false;
  
  /**
   * Iterate stakes from the last one, and deduct the unstaked amount.
   * The contract always unstakes from the most recent stake position.
   */
  for (let _i = stakes.length - 1; _i >= 0; _i--) {

    if (deducted === true) break;

    let totalStaked = integerToDecimal(contract.totalStaked());
    let totalStakingShares = integerToDecimal(contract.totalStakingShares());
    let stakingSharesToBurn = totalStakingShares.times(unstakedAmount).div(totalStaked);

    let stakeId = stakes[_i]!;
    let stake = Stake.load(stakeId)!;

    if (unstakedAmount >= stake.amount) {
      unstakedAmount = unstakedAmount.minus(stake.amount);
      stakes.pop();
      user.stakes = stakes;
    } else {
      stake.amount = stake.amount.minus(unstakedAmount);
      stake.shares = stake.shares.minus(stakingSharesToBurn);
      stake.save();
    }

    if (unstakedAmount == ZERO_BIG_DECIMAL) {
      deducted = true;
    }

  }
  
  user.totalStaked = integerToDecimal(event.params.total);

  // Update stats
  user.operations = user.operations.plus(ONE_BIG_INT);
  geyser.operations = geyser.operations.plus(ONE_BIG_INT);

  geyser.updated = event.block.timestamp;

  user.save();
  geyser.save();
}

export function handleTokensClaimed(event: TokensClaimed): void {
  // Load token geyser.
  let geyser = TokenGeyser.load(event.address.toHexString())!;
  
  // Load or create user.
  let user = User.load(event.params.user.toHexString())!;

  // Add claimed rewards to user eaned amount.
  user.earned = user.earned.plus(integerToDecimal(event.params.amount));

  // Update stats.
  geyser.updated = event.block.timestamp;
  
  user.save();
  geyser.save();
}

export function handleTokensLocked(event: TokensLocked): void {
  let geyserContract = TokenGeyserContract.bind(event.address);

  let stakingToken = Token.load(geyserContract.getStakingToken().toHexString());
  if (stakingToken == null) {
    stakingToken = createNewToken(geyserContract.getStakingToken());
    stakingToken.save();
  }

  log.debug('Saved the Staking Token.', []);

  let rewardToken = Token.load(geyserContract.getDistributionToken().toHexString());
  if (rewardToken == null) {
    rewardToken = createNewToken(geyserContract.getDistributionToken());
    rewardToken.save();
  }
 
  log.debug('Saved the Reward Token.', []);

  let geyser = TokenGeyser.load(event.address.toHexString());
  if (geyser == null) {
    geyser = new TokenGeyser(event.address.toHexString());
  }

  // Assign default values to the TokenGeyser entity.
  geyser.stakingToken = stakingToken.id;
  geyser.rewardToken = rewardToken.id;

  
  let accounting = geyserContract.try_updateAccounting();
  let globalStakingSharesSeconds: BigDecimal;
  if (!accounting.reverted) {
    globalStakingSharesSeconds = integerToDecimal(accounting.value.value3);
  }
  geyser.globalSharesSec = globalStakingSharesSeconds;
  geyser.durationSec = event.params.durationSec;
  geyser.bonusPeriodSec = geyserContract.bonusPeriodSec();
  geyser.sharesPerToken = ZERO_BIG_INT;
  
  geyser.users = ZERO_BIG_INT;
  geyser.operations = ZERO_BIG_INT;
  
  geyser.staked = ZERO_BIG_DECIMAL;
  geyser.rewards = ZERO_BIG_DECIMAL;
  geyser.unlockedRewards = ZERO_BIG_DECIMAL;
  geyser.lockedRewards = ZERO_BIG_DECIMAL;
  geyser.totalUnlockedRewards = ZERO_BIG_DECIMAL;

  geyser.stakedUSD = ZERO_BIG_DECIMAL;
  geyser.rewardsUSD = ZERO_BIG_DECIMAL;
  geyser.unlockedRewards = ZERO_BIG_DECIMAL;
  geyser.lockedRewards = ZERO_BIG_DECIMAL;
 
  geyser.tvl = ZERO_BIG_DECIMAL;
  geyser.apr = ZERO_BIG_DECIMAL;
  geyser.updated = ZERO_BIG_INT;

  geyser.createdBlock = event.block.number;
  geyser.createdTimestamp = event.block.timestamp;

  geyser.save();
  log.debug('Saved Geyser.', []);
}

export function handleTokensUnlocked(event: TokensUnlocked): void {
  // Load token geyser.
  let geyser = TokenGeyser.load(event.address.toHexString())!;

  // Update stats.
  let unlockedAmount = integerToDecimal(event.params.amount);
  geyser.totalUnlockedRewards = geyser.totalUnlockedRewards.plus(unlockedAmount);
  let lockedAmount = integerToDecimal(event.params.total);
  geyser.lockedRewards = lockedAmount;
  geyser.updated = event.block.timestamp;
  
  geyser.save();
}

export function handleBlock(block: ethereum.Block): void {

  if (block.number.mod(BigInt.fromI32(100)).notEqual(ZERO_BIG_INT)) {
    return;
  }

  for (let i = 0; i < trackedGeysers.length; i++) {
    let geyser = TokenGeyser.load(trackedGeysers[i])!;
    let contract = TokenGeyserContract.bind(Address.fromString(geyser.id));
    let stakingToken = Token.load(geyser.stakingToken)!;
    let rewardToken = Token.load(geyser.rewardToken)!;
    
    updatePrices(geyser, contract, stakingToken, rewardToken, block);
    
    geyser.updated = block.timestamp;

    // store
    geyser.save();
    stakingToken.save();
    rewardToken.save();
  }
}