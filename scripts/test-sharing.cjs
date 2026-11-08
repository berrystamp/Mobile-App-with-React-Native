const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const calls = [];
const native = { Platform: { OS: 'android' }, Share: { share: async (payload) => calls.push(payload) } };
const exportsObject = {};
const source = fs.readFileSync(path.join(__dirname, '../lib/sharing.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(code, { exports: exportsObject, require: () => native, process: { env: {} } });

async function main() {
  const { resourceShareUrl, shareResourceLink } = exportsObject;
  const designUrl = resourceShareUrl('design', 12);
  assert.equal(designUrl, 'https://berrystamp.com/products?designId=12');
  assert.equal(resourceShareUrl('profile', 3), 'https://berrystamp.com/my-shop?profileId=3');
  assert.equal(resourceShareUrl('collection', 8, 3), 'https://berrystamp.com/my-shop?profileId=3&collectionId=8');
  assert.throws(() => resourceShareUrl('collection', 8));
  assert.equal(new URL(resourceShareUrl('profile', 'a&b')).searchParams.get('profileId'), 'a&b');
  for (const platform of ['android', 'ios', 'web']) {
    native.Platform.OS = platform;
    await shareResourceLink('Design', designUrl);
    const payload = calls.at(-1);
    assert.ok(payload.message.includes(designUrl), `${platform} must send a clickable URL in its text`);
    if (platform === 'ios') assert.equal(payload.url, designUrl);
  }
  console.log('Sharing checks passed for resource URLs and Android, iOS, and web payloads.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
