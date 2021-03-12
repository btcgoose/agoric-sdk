// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
import '@agoric/zoe/tools/prepare-test-env';
// eslint-disable-next-line import/no-extraneous-dependencies
import test from 'ava';
import { makeIssuerKit } from '@agoric/ertp';

import { multiplyBy, makeRatioFromAmounts } from '../../../src/contractSupport';
import {
  make100Percent,
  make0Percent,
  oneMinus,
} from '../../../src/contracts/callSpread/percent';

// duplicated from test-ratio, but should go away with the amount refactoring
function amountsEqual(t, a1, a2, brand) {
  const brandEqual = a1.brand === a2.brand;
  const valueEqual = a1.value === a2.value;
  const correctBrand = a1.brand === brand;
  if (brandEqual && valueEqual && correctBrand) {
    t.truthy(brandEqual);
  } else if (brandEqual && correctBrand) {
    t.fail(`expected equal values: ${a1.value} !== ${a2.value}`);
  } else if (valueEqual) {
    t.fail(`Expected brand ${brand}, but got ${a1.brand} and ${a2.brand}`);
  } else if (!brandEqual && !valueEqual && !correctBrand) {
    t.fail(`nothing matches ${a1}, ${a2}, ${brand}`);
  } else {
    t.fail(
      `neither values: (${a1.value}, ${a2.value}) nor brands matched (${brand} expected) ${a1.brand}, ${a2.brand})`,
    );
  }
}

test('ratio - ALL', t => {
  const { amountMath, brand } = makeIssuerKit('moe');
  const moe = amountMath.make;

  amountsEqual(
    t,
    multiplyBy(moe(100000), make100Percent(brand)),
    moe(100000),
    brand,
  );
});

test('ratio - NONE', t => {
  const { amountMath, brand } = makeIssuerKit('moe');
  const moe = amountMath.make;

  amountsEqual(
    t,
    amountMath.getEmpty(),
    multiplyBy(moe(100000), make0Percent(brand)),
    brand,
  );
});

test('ratio - complement', t => {
  const { amountMath, brand } = makeIssuerKit('moe');
  const moe = amountMath.make;

  const oneThird = makeRatioFromAmounts(moe(1), moe(3));
  const twoThirds = oneMinus(oneThird);

  amountsEqual(t, multiplyBy(moe(100000), oneThird), moe(33333), brand);
  amountsEqual(t, multiplyBy(moe(100000), twoThirds), moe(66666), brand);

  t.throws(() =>
    oneMinus(moe(3), {
      message: 'Ratio must be a record with 4 fields',
    }),
  );
  t.throws(() => oneMinus(makeRatioFromAmounts(moe(30), moe(20))), {
    message: 'Parameter must be less than or equal to 1: (a bigint)/(a bigint)',
  });
});
