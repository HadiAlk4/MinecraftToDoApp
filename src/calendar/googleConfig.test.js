import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveGoogleClientIds, shouldUseDemoSignIn } from './googleConfig.js';

test('prefers environment client ids over app.json extra', () => {
  const ids = resolveGoogleClientIds({
    env: { EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: 'web-from-env' },
    extra: {
      googleWebClientId: 'web-from-extra',
      googleIosClientId: 'ios-from-extra',
    },
    platform: 'ios',
  });

  assert.equal(ids.webClientId, 'web-from-env');
  assert.equal(ids.platformClientId, 'ios-from-extra');
  assert.equal(ids.isConfigured, true);
});

test('falls back to the web client id on Android', () => {
  const ids = resolveGoogleClientIds({
    env: { EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: 'web-client' },
    platform: 'android',
  });

  assert.equal(ids.platformClientId, 'web-client');
});

test('keeps Google Calendar when a client id is configured', () => {
  assert.equal(shouldUseDemoSignIn({ isConfigured: true }), false);
  assert.equal(shouldUseDemoSignIn({ isConfigured: false }), true);
});

test('reports unconfigured when every client id is blank', () => {
  const ids = resolveGoogleClientIds({
    extra: { googleWebClientId: '   ' },
    platform: 'web',
  });

  assert.equal(ids.isConfigured, false);
  assert.equal(ids.platformClientId, '');
});
