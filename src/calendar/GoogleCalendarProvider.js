import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
        if (!active || !stored) {
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
  }, [platformClientId]);

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
  }, [platformClientId, promptAsync, request]);

  const disconnect = useCallback(async () => {
    const token = auth?.accessToken;
    setAuth(null);
    await clearCalendarAuth();
    if (!token) {
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
    const accessToken = requireToken();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const event = buildCalendarEvent({ title, description, dueDate, dueTime, timeZone });
    return createCalendarEvent({ accessToken, event });
  }, [requireToken]);

  const removeEvent = useCallback(async (eventId) => {
    if (!eventId) {
      return { alreadyGone: true };
    }
    const accessToken = requireToken();
    return deleteCalendarEvent({ accessToken, eventId });
  }, [requireToken]);

  const loadUpcoming = useCallback(async () => {
    const accessToken = requireToken();
    return listUpcomingEvents({
      accessToken,
      timeMin: new Date().toISOString(),
    });
  }, [requireToken]);

  const value = useMemo(() => ({
    ready,
    isConfigured: ids.isConfigured,
    isConnected: Boolean(auth?.accessToken && auth.expiresAt > Date.now()),
    email: auth?.email || '',
    name: auth?.name || '',
    errorMessage,
    connect,
    disconnect,
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
    loadUpcoming,
    ready,
    removeEvent,
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
