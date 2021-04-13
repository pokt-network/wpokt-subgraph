import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';

// BigDecimal
export let ONE_BIG_DECIMAL = BigDecimal.fromString('1');
export let ZERO_BIG_DECIMAL = BigDecimal.fromString('0');

// BigInt
export let ONE_BIG_INT = BigInt.fromI32(1);
export let ZERO_BIG_INT = BigInt.fromI32(0);

// Time
export let ONE_MINUTE = BigDecimal.fromString('60'); 
export let ONE_HOUR = BigDecimal.fromString('60');
export let ONE_DAY = BigDecimal.fromString('24');
export let MONTHS_IN_YEAR = BigDecimal.fromString('12');
export let DAYS_IN_YEAR = BigDecimal.fromString('365.25');
export let DAYS_IN_MONTH = BigDecimal.fromString('30.25');

// Balancer (sUSD = WPOKT for testing purposes)
export let WPOKT_DAI_BPOOL = '0x111deccc63846fa4225bbbebaf6f017760acb671';
export let WPOKT_ADDRESS = '0xf8794ee383b3a265cfbbf456b7cda904c2d1fc6b';
export let DAI_ADDRESS = '0x947b4082324af403047154f9f26f14538d775194';