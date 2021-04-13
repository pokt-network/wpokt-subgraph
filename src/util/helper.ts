import {
    Address,
    BigInt,
    BigDecimal
  } from '@graphprotocol/graph-ts';
import { Token } from '../types/schema';
import { ERC20 } from '../types/TokenGeyser/ERC20';
import { ZERO_BIG_DECIMAL, ZERO_BIG_INT, ONE_MINUTE, ONE_HOUR, ONE_DAY, DAYS_IN_MONTH } from '../util/constants';

export function createNewToken(address: Address): Token {
    let tokenContract = ERC20.bind(address);
  
    // Initialize an empty token
    let token = new Token(tokenContract._address.toHexString());
    token.name = '';
    token.symbol = '';
    token.type = 'Standard';
    token.decimals = ZERO_BIG_INT;
    token.totalSupply = ZERO_BIG_INT;
    token.price = ZERO_BIG_DECIMAL;
    token.updated = ZERO_BIG_INT;
  
    // Update token information from contract.
    let resName = tokenContract.try_name();
    if (!resName.reverted) {
      token.name = resName.value;
    }
    let resSymbol = tokenContract.try_symbol();
    if (!resSymbol.reverted) {
      token.symbol = resSymbol.value;
    }
    let resDecimals = tokenContract.try_decimals();
    if (!resDecimals.reverted) {
      token.decimals = BigInt.fromI32(resDecimals.value as i32);
    }
    let resSupply = tokenContract.try_totalSupply();
    if (!resSupply.reverted) {
      token.totalSupply = resSupply.value;
    }
  
    return token;
  }

  export function integerToDecimal(
    value: BigInt,
    decimals: BigInt = BigInt.fromI32(6)
  ): BigDecimal {
    let denom = BigInt.fromI32(10).pow(decimals.toI32() as u8);
    return value.toBigDecimal().div(denom.toBigDecimal());
  }

  export function secondsToDays(
    seconds: BigInt
  ): BigDecimal {

    let minutes = seconds.divDecimal(ONE_MINUTE);
    let hours = minutes.div(ONE_HOUR);
    let days = hours.div(ONE_DAY);
    
    return days;
  }

export function daysToMonths(
  days: BigDecimal
): BigDecimal {
  let months = days.div(DAYS_IN_MONTH);
  
  return months;
}