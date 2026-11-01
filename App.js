import React from "react";

import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/screens/HomeScreen';
import AddNewToDoScreen from './src/screens/AddNewToDoScreen';
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
    <GoogleCalendarProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddToDo" component={AddNewToDoScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GoogleCalendarProvider>
  );
};

export default App;