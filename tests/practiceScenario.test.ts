import test from 'node:test';
import assert from 'node:assert/strict';
import * as scenarioModule from '../src/data/scenarios.ts';

test('과거 시나리오 3개만 투자 대상으로 제공한다', () => {
  assert.equal(scenarioModule.scenarios.length, 3);
  assert.deepEqual(
    scenarioModule.scenarios.map((scenario) => scenario.id),
    ['corona', 'subprime', 'dotcom'],
  );
  assert.equal('practiceScenario' in scenarioModule, false);
  assert.equal(scenarioModule.scenarios.some((scenario) => scenario.id === 'practice'), false);
  assert.equal(scenarioModule.scenarios.some((scenario) => scenario.initialCash === 1000000000), false);
});
