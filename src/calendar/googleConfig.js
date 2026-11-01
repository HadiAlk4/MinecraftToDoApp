function cleanClientId(value) {
  return String(value ?? '').trim();
}

export function resolveGoogleClientIds({ env = {}, extra = {}, platform = 'web' } = {}) {
  const webClientId = cleanClientId(env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? extra.googleWebClientId);
  const iosClientId = cleanClientId(env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? extra.googleIosClientId);
  const androidClientId = cleanClientId(env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? extra.googleAndroidClientId);

  let platformClientId = webClientId;
  if (platform === 'ios') {
    platformClientId = iosClientId || webClientId;
  } else if (platform === 'android') {
    platformClientId = androidClientId || webClientId;
  } else if (!webClientId) {
    platformClientId = iosClientId || androidClientId;
  }

  return {
    webClientId,
    iosClientId,
    androidClientId,
    platformClientId,
    isConfigured: Boolean(platformClientId),
  };
}

export function shouldUseDemoSignIn({ isConfigured }) {
  return !isConfigured;
}
