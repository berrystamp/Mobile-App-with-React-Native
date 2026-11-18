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
  'react-native': { Platform: { OS: 'ios' } },
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
      get: async (url, config) => { requests.push({ method: 'GET', url, config }); return { data: { responseBody: [] } }; },
      patch: async (url, data, config) => { requests.push({ method: 'PATCH', url, data, config }); return { data: { requestSuccessful: true } }; },
      put: async (url, data, config) => { requests.push({ method: 'PUT', url, data, config }); return { data: { requestSuccessful: true, responseBody: data } }; },
      post: async (url, data, config) => { requests.push({ method: 'POST', url, data, config }); return { data: { requestSuccessful: true } }; },
    };
    if (name.startsWith('@/')) return load(name.slice(2) + '.ts');
    if (name.startsWith('.')) return load(path.resolve(path.dirname(absolute), name + '.ts'));
    return require(name);
  };
  vm.runInThisContext(`(function(require, module, exports) { ${output}\n})`, { filename: absolute })(localRequire, module, module.exports);
  return module.exports;
}

const { getAccountProfile } = load('lib/accountProfile.ts');
const { normalizeConversationsResponse, markConversationReadLocally } = load('lib/messages.ts');
const { transactionDirection, transactionAmount } = load('lib/wallet.ts');
const { nextShopLocationUpdate } = load('lib/shopLocation.ts');
const { normalizeManageOrder, normalizeManageOrderListResponse } = load('lib/orders.ts');
const {
  normalizeDesign,
  STANDARD_PRODUCT_CATEGORIES,
  STANDARD_SIZES,
  matchesProductCategory,
} = load('lib/designs.ts');

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

test('markMessageAsRead hits PATCH /messages/send/{id}/read and local read state clears unread count', async () => {
  state.role = 'customer';
  const api = load('services/apiClient.ts').default;
  await api.markMessageAsRead('42');
  assert.equal(requests.at(-1).method, 'PATCH');
  assert.equal(requests.at(-1).url, '/messages/send/42/read');

  markConversationReadLocally('99', '42', '2026-07-17T10:00:00Z');
  const convos = normalizeConversationsResponse([
    {
      id: 99,
      hasUnreadMessages: true,
      unreadMessageCount: 3,
      lastMessageTimestamp: '2026-07-17T10:00:00Z',
      lastMessage: { id: 42, content: 'Hello', read: false },
      participants: [{ id: 1, profileType: 'CUSTOMER' }, { id: 4, profileType: 'DESIGNER' }],
    },
  ], 1);
  assert.equal(convos[0].hasUnreadMessages, false);
  assert.equal(convos[0].unreadCount, 0);
});

test('normalizeDesign populates standard sizes, locked status, influencer flag, and product categories', () => {
  assert.equal(STANDARD_PRODUCT_CATEGORIES.length, 9);
  assert.deepEqual(STANDARD_SIZES, ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL']);

  const regularDesign = normalizeDesign({
    id: 28,
    name: 'Pumpkin Nightmare',
    amount: 2700,
    openForCustomization: true,
    mocks: [{ id: 101, name: 'Sweat Shirt', category: 'Others', limitedStatus: true, availableQty: 15, colours: ['black'] }],
  });
  assert.equal(regularDesign.locked, false);
  assert.equal(regularDesign.influencerMerch, false);
  assert.deepEqual(regularDesign.mocks[0].sizes, ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL']);
  assert.equal(matchesProductCategory(regularDesign, ['Clothing/Apparel']), true);
  assert.equal(matchesProductCategory(regularDesign, ['Phone Case']), false);

  const lockedAndInfluencerDesign = normalizeDesign({
    id: 18,
    name: 'napybara fleece',
    amount: 1500,
    openForCustomization: false,
    printer: { id: 7, name: 'Berrystamp Print' },
    influencerMerch: true,
    mocks: [{ id: 102, name: 'Hoodie', category: 'Clothing', availableQty: 10, colours: ['black'] }],
  });
  assert.equal(lockedAndInfluencerDesign.locked, true);
  assert.equal(lockedAndInfluencerDesign.influencerMerch, true);
});

test('normalizeManageOrderListResponse isolates printer and designer orders by role', () => {
  const rawOrders = [
    { id: 1, title: 'Print Job', orderRequest: { orderType: 'PRINT', providerProfile: { id: 7, profileType: 'PRINTER' } } },
    { id: 2, title: 'Custom Logo', orderRequest: { orderType: 'DESIGN', providerProfile: { id: 4, profileType: 'DESIGNER' } } },
  ];
  const printerOrders = normalizeManageOrderListResponse(rawOrders, 'PRINTER', 7);
  const designerOrders = normalizeManageOrderListResponse(rawOrders, 'DESIGNER', 4);
  assert.deepEqual(printerOrders.map((o) => o.id), ['1']);
  assert.deepEqual(designerOrders.map((o) => o.id), ['2']);
});

