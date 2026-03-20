import 'react-native-gesture-handler'; // MUST BE LINE 1
import React from "react";



import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/screens/HomeScreen';
import AddNewToDoScreen from './src/screens/AddNewToDoScreen';

const Stack = createStackNavigator();

const App = () => {
  return (

    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AddToDo" component={AddNewToDoScreen} />
        </Stack.Navigator>

    </NavigationContainer>

  );
};

export default App;