// jest.setup.js — load .env.test (or .env) before all server tests
require('dotenv').config({ path: '.env.test' });
// Silence console.log during tests unless DEBUG=true
if (!process.env.DEBUG) {
  global.console.log = jest.fn();
}
