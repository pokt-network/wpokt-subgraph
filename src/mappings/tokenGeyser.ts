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
import { log } from '@graphprotocol/graph-ts';
import { createNewToken } from '../util/helper';

export function handleStaked(event: Staked): void {
  // Load the TokenGeyser instance from db.
  let geyser = TokenGeyser.load(event.address.toHexString())!;

  // Load staking token & reward token from db.
  // TODO: update tokens pricing.
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

  let stake = new Stake(stakeId);
  stake.amount = event.params.amount;
  stake.user = user.id;

  // Update stats information
  stake.timestamp = event.block.timestamp;

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

export function handleUnstaked(event: Unstaked): void {}

export function handleTokensClaimed(event: TokensClaimed): void {}

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

  // geyser entity
  geyser.stakingToken = stakingToken.id;
  geyser.rewardToken = rewardToken.id;
  geyser.startBonus = geyserContract.startBonus();
  geyser.bonusPeriodSec = geyserContract.bonusPeriodSec();
  geyser.createdBlock = event.block.number;
  geyser.createdTimestamp = event.block.timestamp;

  geyser.users = ZERO_BIG_INT;
  geyser.operations = ZERO_BIG_INT;
  geyser.staked = ZERO_BIG_DECIMAL;
  geyser.rewards = ZERO_BIG_DECIMAL;

  geyser.tvl = ZERO_BIG_DECIMAL;
  geyser.apy = ZERO_BIG_DECIMAL;
  geyser.sharesPerToken = ZERO_BIG_DECIMAL;
  geyser.updated = ZERO_BIG_INT;

  geyser.save();
  log.debug('Saved Geyser.', []);
}

export function handleTokensUnlocked(event: TokensUnlocked): void {}