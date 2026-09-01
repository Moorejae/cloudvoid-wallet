#!/usr/bin/env node
/**
 * bump-version.js — bump app.json version + versionCode to the given run number.
 * Used by the GitHub Actions build-apk workflow so every pushed build has a
 * unique, monotonic version (drives the in-app "Check for Updates").
 *
 * Usage: node scripts/bump-version.js <run_number>
 */
const fs = require('fs');
const path = require('path');

const run = process.argv[2];
if (!run || !/^\d+$/.test(run)) {
  console.error('Usage: node scripts/bump-version.js <run_number>');
  process.exit(1);
}

const appJsonPath = path.join(__dirname, '..', 'app.json');
const cfg = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

cfg.expo.version = `1.0.${run}`;
cfg.expo.android = cfg.expo.android || {};
cfg.expo.android.versionCode = parseInt(run, 10);

fs.writeFileSync(appJsonPath, JSON.stringify(cfg, null, 2) + '\n');
console.log(`Bumped app.json -> version ${cfg.expo.version}, versionCode ${cfg.expo.android.versionCode}`);
