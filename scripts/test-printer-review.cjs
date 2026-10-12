/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const state = { role: 'printer', setAccountType(role) { this.role = role; }, logout() { this.role = 'customer'; } };
const storage = new Map();
const requests = [];
const mocks = {
  '@/store/authStore': { useAuthStore: { getState: () => state }, toAccountType: (role) => role.toLowerCase() },
  '@react-native-async-storage/async-storage': {
    getItem: async (key) => storage.get(key) ?? null,
    setItem: async (key, value) => storage.set(key, value),
    removeItem: async (key) => storage.delete(key),
  },
};
const cache = new Map();
function load(file) {
  const absolute = path.resolve(root, file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const module = { exports: {} };
  cache.set(absolute, module);
  const source = fs.readFileSync(absolute, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const localRequire = (name) => {
    if (mocks[name]) return mocks[name];
    if (name === './api') return {
      get: async (url, config) => { requests.push({ url, config }); return { data: { responseBody: [] } }; },
    };
    if (name.startsWith('@/')) return load(name.slice(2) + '.ts');
    if (name.startsWith('.')) return load(path.resolve(path.dirname(absolute), name + '.ts'));
    return require(name);
  };
  vm.runInThisContext(`(function(require, module, exports) { ${output}\n})`, { filename: absolute })(localRequire, module, module.exports);
  return module.exports;
}

const { getAccountProfile } = load('lib/accountProfile.ts');
const { normalizeConversationsResponse } = load('lib/messages.ts');
const { transactionDirection, transactionAmount } = load('lib/wallet.ts');
const { nextShopLocationUpdate } = load('lib/shopLocation.ts');
const { normalizeManageOrder } = load('lib/orders.ts');

test('printer account selects printer profile when the same user also has a designer profile', () => {
  const user = { id: 1, designerProfile: { id: 20 }, printerProfile: { id: 30 } };
  assert.equal(getAccountProfile(user, 'PRINTER').id, 30);
  assert.equal(getAccountProfile(user, 'customer'), null);
});

test('conversation list excludes another account role and identifies a same-role peer by profile ID', () => {
  const response = [
    { id: 1, participants: [{ id: 20, profileType: 'DESIGNER' }, { id: 40, profileType: 'CUSTOMER' }] },
    { id: 2, participants: [{ id: 30, profileType: 'PRINTER' }, { id: 40, profileType: 'CUSTOMER', name: 'Customer' }] },
    { id: 3, participants: [{ id: 30, profileType: 'PRINTER' }, { id: 50, profileType: 'PRINTER', name: 'Another printer' }] },
  ];
  const list = normalizeConversationsResponse(response, 30);
  assert.deepEqual(list.map((item) => item.id), ['2', '3']);
  assert.equal(list[0].role, 'Customer');
  assert.equal(list[1].participantId, 50);
});

test('credit classification uses transactionType consistently and never labels unknown transactions debit', () => {
  assert.equal(transactionDirection({ transactionType: 'CREDIT', type: 'DEBIT' }), 'CREDIT');
  assert.equal(transactionDirection({ direction: 'deposit' }), 'CREDIT');
  assert.equal(transactionDirection({ type: 'WITHDRAWAL' }), 'DEBIT');
  assert.equal(transactionDirection({}), 'UNKNOWN');
  assert.equal(transactionAmount({ amount: '-1200' }), 1200);
});

test('location interval uses calendar months, including February and invalid dates', () => {
  assert.equal(nextShopLocationUpdate('2025-12-31T10:00:00Z').toISOString(), '2026-02-28T10:00:00.000Z');
  assert.equal(nextShopLocationUpdate('2023-12-31T10:00:00Z').toISOString(), '2024-02-29T10:00:00.000Z');
  assert.equal(nextShopLocationUpdate('invalid'), null);
});

test('print order metadata retains the printer and customer rather than substituting the designer', () => {
  const order = normalizeManageOrder({ id: 10, designerName: 'Design author', orderRequest: {
    providerProfile: { name: 'Print shop', profileType: 'PRINTER' }, customerProfile: { name: 'Buyer' },
  } });
  assert.equal(order.shopName, 'Print shop');
  assert.equal(order.providerRole, 'PRINTER');
  assert.equal(order.customerName, 'Buyer');
});

test('API honors an explicit order profile and updates both persisted and in-memory account state', async () => {
  const api = load('services/apiClient.ts').default;
  await api.getManageOrders({ profileType: 'DESIGNER' });
  assert.equal(requests.at(-1).config.headers.profileType, 'DESIGNER');
  await api.setActiveProfileType('PRINTER');
  assert.equal(storage.get('profileType'), 'PRINTER');
  assert.equal(state.role, 'printer');
  await api.logout();
  assert.equal(storage.has('profileType'), false);
  assert.equal(state.role, 'customer');
});
