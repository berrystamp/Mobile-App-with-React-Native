const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = (async () => {
  return withNativeWind(config, { input: './app/global.css' });
})();