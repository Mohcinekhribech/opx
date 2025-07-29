import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Buffer } from 'buffer';

import { AppModule } from './app/app.module';

// Buffer polyfill for Solana libraries
(window as any).global = window;
(window as any).Buffer = Buffer;

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
