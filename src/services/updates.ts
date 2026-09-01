/**
 * updates.ts — checks GitHub for the latest CloudVoid APK build.
 *
 * The GitHub Actions workflow (build-apk.yml) auto-builds a fresh APK and tags
 * a release `v<run_number>` on every push to `master`. This helper lets the app
 * detect that a newer build exists (Settings → Check for Updates).
 */
import { Platform } from 'react-native';

const REPO = 'Moorejae/cloudvoid-wallet';
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases/latest`;

export interface UpdateInfo {
  currentVersion: string;
  currentVersionCode: number;
  latestVersion: string | null;
  latestVersionCode: number | null;
  updateAvailable: boolean;
  releaseUrl: string | null;
  releaseNotes: string | null;
}

/** Installed app version (set by scripts/bump-version.js before each build). */
export function getInstalledVersion(): { version: string; versionCode: number } {
  let version = '1.0.0';
  let versionCode = 1;
  try {
    // expo-constants is a standard Expo dependency and exposes the app config.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Constants = require('expo-constants');
    const cfg = Constants?.default?.expoConfig || Constants?.expoConfig;
    if (cfg?.version) version = String(cfg.version);
    if (cfg?.android?.versionCode != null) versionCode = Number(cfg.android.versionCode);
  } catch {
    // fall through to defaults
  }
  return { version, versionCode };
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  const { version, versionCode } = getInstalledVersion();
  try {
    const res = await fetch(RELEASES_API, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub release lookup failed (${res.status})`);

    const data = await res.json();
    const tag = String(data.tag_name || '').replace(/^v/, '');
    const latestVersionCode = parseInt(tag.replace(/[^0-9]/g, ''), 10) || 0;

    return {
      currentVersion: version,
      currentVersionCode: versionCode,
      latestVersion: data.tag_name || null,
      latestVersionCode,
      updateAvailable: latestVersionCode > versionCode,
      releaseUrl: data.html_url || null,
      releaseNotes: data.body || data.name || null,
    };
  } catch (err) {
    console.warn('checkForUpdates failed:', err);
    return {
      currentVersion: version,
      currentVersionCode: versionCode,
      latestVersion: null,
      latestVersionCode: null,
      updateAvailable: false,
      releaseUrl: null,
      releaseNotes: null,
    };
  }
}

/** Platform label used in the Settings UI. */
export function platformLabel(): string {
  return Platform.OS === 'web' ? 'Web App' : 'Mobile App (APK)';
}
