import {
  Staked,
  Unstaked,
  TokensClaimed,
  TokensLocked,
  TokensUnlocked
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

export function handleTokensLocked(event: TokensLocked): void {}

export function handleTokensUnlocked(event: TokensUnlocked): void {}