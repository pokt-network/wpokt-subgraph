import {
    Address,
    BigInt,
  } from '@graphprotocol/graph-ts';
import { Token } from '../types/schema';
import { ERC20 } from '../types/TokenGeyser/ERC20';
import { ZERO_BIG_DECIMAL, ZERO_BIG_INT } from '../util/constants';

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