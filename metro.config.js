const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Allow WASM files to be resolved as assets (needed for native builds)
config.resolver.assetExts.push('wasm');

// For web builds, alias tiny-secp256k1 to our pure-JS shim
// so the .wasm loader is never triggered
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'tiny-secp256k1') {
    return {
      filePath: path.resolve(__dirname, 'src/shims/tiny-secp256k1.js'),
      type: 'sourceFile',
    };
  }
  // Fall through to default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
