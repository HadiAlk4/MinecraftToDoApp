import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { formatEventStart } from '../calendar/eventPayload';
import { useGoogleCalendar } from '../calendar/GoogleCalendarProvider';

const CalendarScreen = () => {
  const {
    ready,
    isDemo,
    isConfigured,
    isConnected,
    email,
    errorMessage,
    connect,
    disconnect,
    loadUpcoming,
  } = useGoogleCalendar();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [listError, setListError] = useState('');
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!isConnected) {
        setEvents([]);
        setListError('');
        return undefined;
      }

      let active = true;
      setLoadingEvents(true);
      setListError('');
      loadUpcoming()
        .then((items) => {
          if (active) {
            setEvents(items);
          }
        })
        .catch((error) => {
          if (active) {
            setListError(error.message || 'Could not load events.');
          }
        })
        .finally(() => {
          if (active) {
            setLoadingEvents(false);
          }
        });

      return () => {
        active = false;
      };
    }, [isConnected, loadUpcoming]),
  );

  const onConnectPress = async () => {
    setBusy(true);
    try {
      await connect();
    } finally {
      setBusy(false);
    }
  };

  const onDisconnectPress = async () => {
    setBusy(true);
    try {
      await disconnect();
      setEvents([]);
    } finally {
      setBusy(false);
    }
  };

  const openEvent = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/topbkg.jpg')}
        style={styles.top}
        resizeMode="cover"
      >
        <Text style={styles.title}>Calendar</Text>
      </ImageBackground>

      <ImageBackground
        source={require('../assets/images/mainbkg.jpg')}
        style={styles.main}
        resizeMode="cover"
      >
        {!ready ? (
          <ActivityIndicator color="black" style={styles.spinner} />
        ) : (
          <View style={styles.panel}>
            <Text style={styles.status}>
              {isConnected
                ? `Signed in${email ? ` as ${email}` : ''}`
                : 'Not signed in'}
            </Text>

            {isDemo && (
              <Text style={styles.help}>
                Demo sign-in. This does not use your Google account.
              </Text>
            )}

            {!isDemo && !isConfigured && (
              <Text style={styles.help}>
                Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to a Google OAuth client with the Calendar events scope. Phone builds also need EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID and EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID. Allow the redirect mytodom2://oauthredirect.
              </Text>
            )}

            {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            {!!listError && <Text style={styles.error}>{listError}</Text>}

            <TouchableOpacity
              onPress={isConnected ? onDisconnectPress : onConnectPress}
              disabled={busy}
            >
              <ImageBackground
                style={styles.actionButton}
                source={require('../assets/images/button.png')}
              >
                <Text style={styles.actionText}>
                  {busy ? 'Wait' : isConnected ? 'Sign out' : 'Sign in'}
                </Text>
              </ImageBackground>
            </TouchableOpacity>

            {isConnected && loadingEvents && (
              <ActivityIndicator color="black" style={styles.spinner} />
            )}

            {isConnected && !loadingEvents && events.length === 0 && !listError && (
              <Text style={styles.help}>
                {isDemo ? 'Nothing coming up yet. Add a to-do to put it here.' : 'Nothing coming up on your primary calendar.'}
              </Text>
            )}

            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.eventRow}
                  onPress={() => openEvent(item.htmlLink)}
                >
                  <Text style={styles.eventTitle}>{item.summary}</Text>
                  <Text style={styles.eventWhen}>{formatEventStart(item.start)}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    flex: 0.45,
    justifyContent: 'flex-end',
    borderBottomWidth: 5,
    borderBottomColor: 'black',
  },
  title: {
    fontFamily: 'Pixelpurl',
    fontSize: 52,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
  },
  panel: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  status: {
    fontFamily: 'Pixelpurl',
    fontSize: 22,
    color: 'black',
    textAlign: 'center',
    marginBottom: 8,
  },
  help: {
    fontFamily: 'Pixelpurl',
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginVertical: 8,
    lineHeight: 22,
  },
  error: {
    fontFamily: 'Pixelpurl',
    fontSize: 16,
    color: '#7A1F1F',
    textAlign: 'center',
    marginVertical: 6,
  },
  actionButton: {
    width: 280,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  actionText: {
    fontFamily: 'Pixelpurl',
    fontSize: 32,
    color: 'black',
  },
  spinner: {
    marginTop: 16,
  },
  list: {
    width: '100%',
    marginTop: 8,
  },
  eventRow: {
    backgroundColor: '#F4EBD0',
    borderWidth: 3,
    borderColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 6,
  },
  eventTitle: {
    fontFamily: 'Pixelpurl',
    fontSize: 20,
    color: 'black',
  },
  eventWhen: {
    fontFamily: 'Pixelpurl',
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
});

export default CalendarScreen;
