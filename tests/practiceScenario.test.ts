import test from 'node:test';
import assert from 'node:assert/strict';
import * as scenarioModule from '../src/data/scenarios.ts';
import type { Scenario } from '../src/types/index.ts';

test('과거 시나리오 3개와 별도 모의투자 모드를 구분한다', () => {
  const practiceScenario = scenarioModule.practiceScenario as Scenario | undefined;

  assert.equal(scenarioModule.scenarios.length, 3);
  assert.deepEqual(
    scenarioModule.scenarios.map((scenario) => scenario.id),
    ['corona', 'subprime', 'dotcom'],
  );
  assert.equal(practiceScenario?.id, 'practice');
  assert.equal(practiceScenario?.initialCash, 1000000000);
  assert.equal(scenarioModule.scenarios.some((scenario) => scenario.id === practiceScenario?.id), false);
});
