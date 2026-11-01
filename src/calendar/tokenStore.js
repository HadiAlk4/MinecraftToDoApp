import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'googleCalendarAuth';

export async function saveCalendarAuth(auth) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export async function loadCalendarAuth() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.accessToken || !parsed?.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function clearCalendarAuth() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
