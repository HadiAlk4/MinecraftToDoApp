import React from 'react';

import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ImageBackground,
  Image,
} from 'react-native';


const ToDoItems = ({ ToDoItem }) => {
  return (
    <ImageBackground
      source={require('../assets/images/itemsScroll.png')}
      style={styles.ToDoItemsContainer}
    >
      <Text style={styles.ToDoItems}> {ToDoItem} </Text>
    </ImageBackground>
  );
};

const ToDoButton = ({ label, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <ImageBackground
        style={styles.ToDoButtonStyle}
        source={require('../assets/images/button.png')}
      >
        <Image 
        style = {styles.ToDoButtonPlusIconStyle}
        source={require('../assets/images/PlusButtonIcon.png')} 
        /> 

        <Text style={styles.ToDoButtonTextStyle}> {label} </Text>

      </ImageBackground>
    </TouchableOpacity>
  );
};

const MainHomeScreen = ( { navigation }) => {
  const ToDoButtonPress = () => {
    navigation.navigate('AddToDo');;
  };

  return (
    <View style={styles.container}>
      <ImageBackground // Top Footer
        source={require('../assets/images/topbkg.jpg')}
        style={styles.TopTitle}
        resizeMode="cover"
      >
        <Text style={styles.TopTitleTextStyle}> My ToDo List </Text>
      </ImageBackground>

      <ImageBackground // Main Display
        source={require('../assets/images/mainbkg.jpg')}
        style={styles.MainMiddle}
        resizeMode="cover"
      >
        <ToDoItems ToDoItem="Buy Milk"> </ToDoItems>
        <ToDoItems ToDoItem="Buy Bread"> </ToDoItems>
        <ToDoItems ToDoItem="Buy Carrot"> </ToDoItems>
      </ImageBackground>

      <ImageBackground
        source={require('../assets/images/bottombkg.jpg')}
        resizeMode="cover"
        style={styles.BottomDisplay}
      >
        <ToDoButton label="Add ToDo" onPress={ToDoButtonPress} />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  TopTitle: {
    flex: 0.7,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    borderBottomWidth: 5,
    borderBottomColor: 'black',
  },

  MainMiddle: {
    flex: 3,
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 10,
  },

  BottomDisplay: {
    flex: 1,
    flexDirection: 'column',
    borderTopWidth: 5,
    borderTopColor: 'black',
    alignItems: 'center',
  },

  ToDoButtonStyle: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 5,
    marginTop: 10,
    width: 340,
    height: 65,
  },

  ToDoButtonTextStyle: {
    fontFamily: 'Pixelpurl',
    color: 'black',
    fontSize: 50,
    fontWeight: '600',
  },

  ToDoButtonPlusIconStyle: {
    marginBottom: 5,
    width: 50,
    height: 50,
  },

  TopTitleTextStyle: {
    fontFamily: 'Pixelpurl',
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    padding: 10,
  },

  ToDoItems: {
    fontFamily: 'Pixelpurl',
    fontSize: 26,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    width: '90%',
    borderRadius: 10,
  },
  ToDoItemsContainer: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    marginTop: 10,
    width: 400,
    height: 45,
  },

});

export default MainHomeScreen;
