import React from "react";

import { Platform, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/screens/HomeScreen';
import AddNewToDoScreen from './src/screens/AddNewToDoScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import { GoogleCalendarProvider } from './src/calendar/GoogleCalendarProvider';

const Stack = createStackNavigator();

const App = () => {

  const [loaded] = useFonts({
    'Pixelpurl': require('./src/assets/fonts/Pixelpurl.ttf'),
  });
  if (!loaded) {
    return null; 
  }

  return (
    <View style={styles.page}>
    <View style={styles.phone}>
    <GoogleCalendarProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddToDo" component={AddNewToDoScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GoogleCalendarProvider>
    </View>
    </View>
  );
};

// On the website, keep the app in a phone-sized column in the middle of the
// page instead of stretching it across a wide browser window.
const PHONE_WIDTH = 430;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? '#2b2b2b' : undefined,
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? PHONE_WIDTH : undefined,
    overflow: 'hidden',
  },
});

export default App;