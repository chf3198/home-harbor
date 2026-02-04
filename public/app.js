/**
 * @fileoverview Main application entry point
 * Only initializes when served from a web server (not file://)
 * The inline script in index.html handles single-file mode
 */

import { init } from './init.js';

// Only initialize modular app when served via HTTP
// In file:// mode, the inline script handles everything
if (window.location.protocol !== 'file:') {
  init();
}
