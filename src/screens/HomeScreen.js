import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ImageBackground,
  Image,
  FlatList,
} from 'react-native';
import { LoadToDo } from '../helperfunctions/StorageHelper';




const ToDoItems = ({ item }) => {

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ImageBackground
      source={require('../assets/images/itemsScroll.png')}
      style={styles.ToDoItemsContainer}
    >

      <ExplandButton 
      
      isExpanded={isExpanded}
      onPress={() => setIsExpanded(!isExpanded)}
      > </ExplandButton>
      <Text style={styles.ToDoItems}> {item.title} </Text>

      {isExpanded && (
        <View style={styles.ExpandedContent}>
          <Text style={styles.DescriptionText}> {item.description}</Text>

          <View style={styles.TickContent}>

          </View>
        </View>
      )}


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
          style={styles.ToDoButtonPlusIconStyle}
          source={require('../assets/images/PlusButtonIcon.png')}
        />

        <Text style={styles.ToDoButtonTextStyle}> {label} </Text>


      </ImageBackground>
    </TouchableOpacity>
  );
};


const ExplandButton = ({ onPress, isExpanded }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        style={{ width: 30, height: 30,  transform: [{ rotate: isExpanded ? '180deg' : '0deg' }]}}
        source={require('../assets/images/DownCaret.png')} >
      </Image>

    </TouchableOpacity>
  );
};

const MainHomeScreen = ({ navigation }) => {
  const ToDoButtonPress = () => {
    navigation.navigate('AddToDo');;
  };

  const [ToDos, SetToDos] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const savedData = await LoadToDo('myToDos');
        if (savedData) {
          SetToDos(savedData);
        }
      };

      fetchData();

      return () => { };
    }, [])
  );

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
        {/* <ToDoItems ToDoItem="Buy Milk"> </ToDoItems>
        <ToDoItems ToDoItem="Buy Bread"> </ToDoItems>
        <ToDoItems ToDoItem="Buy Carrot"> </ToDoItems> */}


        <FlatList
          data={ToDos}
          style={{ width: '100%', flex: 1 }}
          contentContainerStyle={{ alignItems: 'center' }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ToDoItems item={item} />
          )}
        />

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
    paddingHorizontal: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    marginVertical: 5,
    marginTop: 10,
    width: 400,
    minHeight: 45,
  },
  
  ExpandedContent: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  DescriptionText: {
    fontFamily: 'Pixelpurl',
    fontSize: 18,
    color: 'black',
    textAlign: 'left',
    marginTop: 5,
    paddingHorizontal: 10,
  },
  TickContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },

});

export default MainHomeScreen;
