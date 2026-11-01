import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'demoCalendarEvents';

export async function loadDemoEvents() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw == null) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveDemoEvents(events) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export async function clearDemoEvents() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
