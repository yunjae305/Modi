import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('PDF 계획서 기준 라우트와 화면을 제공한다', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  const landing = readFileSync('src/pages/LandingPage.tsx', 'utf8');

  for (const file of [
    'src/pages/ModeSelectPage.tsx',
    'src/pages/TradeDashboardPage.tsx',
    'src/pages/TutorialPage.tsx',
    'src/pages/ScenarioSelectPage.tsx',
    'src/pages/SimulationPage.tsx',
    'src/pages/ResultPage.tsx',
  ]) {
    assert.equal(existsSync(file), true, file);
  }

  for (const route of ['/', '/login', '/tutorial', '/mode-select', '/select', '/simulation', '/result', '/trade']) {
    assert.match(app, new RegExp(`path="${route.replace('/', '\\/')}"`));
  }

  assert.match(landing, /모드 선택/);
  assert.match(landing, /navigate\('\/mode-select'\)/);
});

test('로그인은 Kakao와 게스트 세션을 제공한다', () => {
  const loginPage = readFileSync('src/pages/LoginPage.tsx', 'utf8');
  const authStore = readFileSync('src/store/authStore.ts', 'utf8');
  const providers = readFileSync('api/auth/providers.ts', 'utf8');
  const authTypes = readFileSync('src/types/auth.ts', 'utf8');

  assert.equal(existsSync('api/auth/guest.ts'), true);
  assert.match(loginPage, /Kakao로 시작하기/);
  assert.match(loginPage, /게스트로 시작하기/);
  assert.match(authStore, /loginGuest/);
  assert.match(providers, /guest: hasProvider\('GUEST'\)/);
  assert.match(authTypes, /'GUEST'/);
});

test('모의투자 대시보드는 5초마다 포트폴리오와 랭킹을 갱신한다', () => {
  const tradePage = readFileSync('src/pages/TradeDashboardPage.tsx', 'utf8');

  for (const file of [
    'api/stocks.ts',
    'api/portfolio.ts',
    'api/executions.ts',
    'api/rankings.ts',
    'api/orders/buy.ts',
    'api/orders/sell.ts',
    'api/prices/sync.ts',
  ]) {
    assert.equal(existsSync(file), true, file);
  }

  assert.match(tradePage, /apiGet<StockItem\[\]>\('\/stocks'\)/);
  assert.match(tradePage, /apiGet<PortfolioSummary>\('\/portfolio'\)/);
  assert.match(tradePage, /apiGet<RankingItem\[\]>\('\/rankings'\)/);
  assert.match(tradePage, /apiGet<ExecutionItem\[\]>\('\/executions'\)/);
  assert.match(tradePage, /apiPost<OrderResult>\('\/orders\/buy'/);
  assert.match(tradePage, /apiPost<OrderResult>\('\/orders\/sell'/);
  assert.match(tradePage, /setInterval\(loadDashboard, 5000\)/);
});

test('TooT에서는 필요한 주식 용어 콘텐츠만 Modi 튜토리얼에 병합한다', () => {
  const tutorial = readFileSync('src/pages/TutorialPage.tsx', 'utf8');
  const terms = readFileSync('src/data/learningTerms.ts', 'utf8');

  assert.equal(existsSync('TooT'), false);
  assert.match(tutorial, /learningTerms/);
  assert.match(tutorial, /용어 퀴즈/);
  for (const word of ['매수', '매도', '손절', '익절', '평단', '예수금', 'PER', 'PBR']) {
    assert.match(terms, new RegExp(word));
  }
  assert.equal(terms.includes('TODO'), false);
});
