import { Buffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
if (typeof (global as any).Buffer === 'undefined') {
  (global as any).Buffer = Buffer;
}

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
