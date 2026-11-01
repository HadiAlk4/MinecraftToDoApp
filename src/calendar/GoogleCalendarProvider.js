import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import {
  CALENDAR_SCOPES,
  createCalendarEvent,
  deleteCalendarEvent,
  fetchGoogleAccount,
  listUpcomingEvents,
} from './GoogleCalendarApi';
import {
  addTodoToDemoCalendar,
  listUpcomingDemoEvents,
  removeDemoEvent,
  seedDemoEvents,
} from './demoCalendar';
import { loadDemoEvents, saveDemoEvents } from './demoStore';
import { buildCalendarEvent } from './eventPayload';
import { resolveGoogleClientIds } from './googleConfig';
import { clearCalendarAuth, loadCalendarAuth, saveCalendarAuth } from './tokenStore';

WebBrowser.maybeCompleteAuthSession();

const GoogleCalendarContext = createContext(null);

function readClientIds() {
  return resolveGoogleClientIds({
    env: {
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    },
    extra: Constants.expoConfig?.extra ?? {},
    platform: Platform.OS,
  });
}

function demoSession() {
  return {
    accessToken: 'demo',
    refreshToken: '',
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    email: 'Demo visitor',
    name: 'Demo',
    demo: true,
  };
}

async function ensureDemoSeed() {
  const existing = await loadDemoEvents();
  if (existing) {
    return existing;
  }
  const seeded = seedDemoEvents();
  await saveDemoEvents(seeded);
  return seeded;
}

function authFromAuthentication(authentication, previous) {
  const expiresIn = authentication?.expiresIn ?? 3600;
  return {
    accessToken: authentication.accessToken,
    refreshToken: authentication.refreshToken || previous?.refreshToken || '',
    expiresAt: Date.now() + expiresIn * 1000,
    email: previous?.email || '',
    name: previous?.name || '',
  };
}

export function GoogleCalendarProvider({ children }) {
  const ids = useMemo(() => readClientIds(), []);
  const platformClientId = ids.platformClientId;
  const isDemo = Platform.OS === 'web' || !ids.isConfigured;
  const leftDemo = useRef(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: platformClientId || 'unconfigured',
    webClientId: ids.webClientId || platformClientId || 'unconfigured',
    iosClientId: ids.iosClientId || ids.webClientId || 'unconfigured',
    androidClientId: ids.androidClientId || ids.webClientId || 'unconfigured',
    scopes: CALENDAR_SCOPES,
    selectAccount: true,
    extraParams: { access_type: 'offline' },
  });

  const [auth, setAuth] = useState(null);
  const [ready, setReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const stored = await loadCalendarAuth();
        if (!active) {
          return;
        }
        if (isDemo) {
          if (stored?.demo && stored.expiresAt > Date.now()) {
            await ensureDemoSeed();
            setAuth(stored);
            return;
          }
          if (Platform.OS === 'web' && !leftDemo.current) {
            const next = demoSession();
            await saveCalendarAuth(next);
            await ensureDemoSeed();
            if (active) {
              setAuth(next);
            }
          }
          return;
        }
        if (!stored) {
          return;
        }
        if (stored.expiresAt > Date.now() + 30000) {
          setAuth(stored);
          return;
        }
        if (!stored.refreshToken || !platformClientId) {
          await clearCalendarAuth();
          return;
        }
        const refreshed = await AuthSession.refreshAsync(
          { clientId: platformClientId, refreshToken: stored.refreshToken },
          Google.discovery,
        );
        const next = authFromAuthentication(refreshed, stored);
        await saveCalendarAuth(next);
        if (active) {
          setAuth(next);
        }
      } catch {
        await clearCalendarAuth();
      } finally {
        if (active) {
          setReady(true);
        }
      }
    };

    restore();
    return () => {
      active = false;
    };
  }, [isDemo, platformClientId]);

  useEffect(() => {
    if (!response) {
      return undefined;
    }
    if (response.type === 'error') {
      setErrorMessage(response.error?.message || response.params?.error_description || 'Google sign-in failed.');
      return undefined;
    }
    if (response.type !== 'success' || !response.authentication?.accessToken) {
      if (response.type === 'success') {
        setErrorMessage('Google did not return an access token.');
      }
      return undefined;
    }

    let active = true;
    const authentication = response.authentication;

    const persist = async () => {
      const next = authFromAuthentication(authentication, null);
      try {
        const account = await fetchGoogleAccount(next.accessToken);
        next.email = account.email;
        next.name = account.name;
      } catch {
        // Event calls can still succeed when the profile request fails.
      }
      await saveCalendarAuth(next);
      if (active) {
        setAuth(next);
        setErrorMessage('');
      }
    };

    persist();
    return () => {
      active = false;
    };
  }, [response]);

  const connect = useCallback(async () => {
    if (isDemo) {
      const next = demoSession();
      await saveCalendarAuth(next);
      await ensureDemoSeed();
      leftDemo.current = false;
      setAuth(next);
      setErrorMessage('');
      return { ok: true, reason: 'demo' };
    }
    if (!platformClientId) {
      setErrorMessage('Add a Google OAuth client ID before connecting Calendar.');
      return { ok: false, reason: 'unconfigured' };
    }
    if (!request) {
      setErrorMessage('Google sign-in is still starting. Try again in a moment.');
      return { ok: false, reason: 'not-ready' };
    }
    setErrorMessage('');
    const result = await promptAsync();
    return { ok: result.type === 'success', reason: result.type };
  }, [isDemo, platformClientId, promptAsync, request]);

  const disconnect = useCallback(async () => {
    const token = auth?.accessToken;
    const wasDemo = Boolean(auth?.demo);
    if (wasDemo) {
      leftDemo.current = true;
    }
    setAuth(null);
    await clearCalendarAuth();
    if (!token || wasDemo) {
      return;
    }
    try {
      await AuthSession.revokeAsync({ token }, Google.discovery);
    } catch {
      // Local sign-out already succeeded.
    }
  }, [auth]);

  const requireToken = useCallback(() => {
    if (!auth?.accessToken || auth.expiresAt <= Date.now()) {
      const error = new Error('Connect Google Calendar again. The sign-in session has expired.');
      error.status = 401;
      throw error;
    }
    return auth.accessToken;
  }, [auth]);

  const createEventForTodo = useCallback(async ({ title, description, dueDate, dueTime }) => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    if (auth?.demo) {
      const existing = await ensureDemoSeed();
      const { events, created } = addTodoToDemoCalendar(existing, {
        title,
        description,
        dueDate,
        dueTime,
        timeZone,
      });
      await saveDemoEvents(events);
      return created;
    }
    const accessToken = requireToken();
    const event = buildCalendarEvent({ title, description, dueDate, dueTime, timeZone });
    return createCalendarEvent({ accessToken, event });
  }, [auth, requireToken]);

  const removeEvent = useCallback(async (eventId) => {
    if (!eventId) {
      return { alreadyGone: true };
    }
    if (auth?.demo || String(eventId).startsWith('demo-')) {
      const existing = (await loadDemoEvents()) || [];
      await saveDemoEvents(removeDemoEvent(existing, eventId));
      return { alreadyGone: !existing.some((event) => event.id === eventId) };
    }
    const accessToken = requireToken();
    return deleteCalendarEvent({ accessToken, eventId });
  }, [auth, requireToken]);

  const loadUpcoming = useCallback(async () => {
    if (auth?.demo) {
      const events = await ensureDemoSeed();
      return listUpcomingDemoEvents(events);
    }
    const accessToken = requireToken();
    return listUpcomingEvents({
      accessToken,
      timeMin: new Date().toISOString(),
    });
  }, [auth, requireToken]);

  const resetDemo = useCallback(async () => {
    const seeded = seedDemoEvents();
    await saveDemoEvents(seeded);
    const next = demoSession();
    await saveCalendarAuth(next);
    leftDemo.current = false;
    setAuth(next);
    setErrorMessage('');
    return listUpcomingDemoEvents(seeded);
  }, []);

  const value = useMemo(() => ({
    ready,
    isDemo,
    isConfigured: ids.isConfigured,
    isConnected: Boolean(auth?.accessToken && auth.expiresAt > Date.now()),
    email: auth?.email || '',
    name: auth?.name || '',
    errorMessage,
    connect,
    disconnect,
    resetDemo,
    createEventForTodo,
    removeEvent,
    loadUpcoming,
  }), [
    auth,
    connect,
    createEventForTodo,
    disconnect,
    errorMessage,
    ids.isConfigured,
    isDemo,
    loadUpcoming,
    ready,
    removeEvent,
    resetDemo,
  ]);

  return (
    <GoogleCalendarContext.Provider value={value}>
      {children}
    </GoogleCalendarContext.Provider>
  );
}

export function useGoogleCalendar() {
  const context = useContext(GoogleCalendarContext);
  if (!context) {
    throw new Error('useGoogleCalendar must be used within GoogleCalendarProvider');
  }
  return context;
}
