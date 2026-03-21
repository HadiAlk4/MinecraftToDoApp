import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';


const GoBackButton = ({label, onPress}) => {

  return (
    <TouchableOpacity onPress ={onPress}>

      <ImageBackground style={ToDoStyles.GoBackButtonStyle} source={require('../assets/images/GoBackButton.png')} >


      </ImageBackground>


    </TouchableOpacity>
  )
}

const AddNewToDoScreenMain = ({navigation}) => {

  const GoBackButtonPress = () => {
    navigation.navigate('Home');
  }

  return (
  <ImageBackground style={ToDoStyles.ToDoContainer} source={require('../assets/images/ScrollBg.png')} resizeMode="stretch">

    

      <Text style={ToDoStyles.TitleTextStyle}> Title </Text> 
      <TextInput style={ToDoStyles.TitleTextInputStyle}>

      </TextInput>

      <Text style={ToDoStyles.DescriptionTextStyle}> Description </Text> 
      <TextInput style={ToDoStyles.DescriptionTextInputStyle}>

      </TextInput>

      <GoBackButton label= "back" onPress={GoBackButtonPress} />
      
    

  </ImageBackground>
  );
};

const ToDoStyles = StyleSheet.create ({

  ToDoContainer: {
    flex: 1,
    alignItems: 'center',
  },

  TitleTextStyle: {
    fontFamily: 'Pixelpurl',
    fontSize: 60,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    paddingTop: 30,
  },

  TitleTextInputStyle: {
    height: 50, 
    width: 250,
    borderColor: "#3F51B5",
    borderWidth: 2, 
    borderRadius: 5, 
    paddingHorizontal: 15,
    fontSize: 16, 
    backgroundColor: "black",
    color: "white",
  },

  DescriptionTextStyle: {
    fontFamily: 'Pixelpurl',
    fontSize: 60,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    padding: 10,
  },

  DescriptionTextInputStyle: {
    height: 50, 
    width: 250,
    borderColor: "#3F51B5",
    borderWidth: 2, 
    borderRadius: 5, 
    paddingHorizontal: 15, 
    fontSize: 16, 
    backgroundColor: "black",
    color: "white",
  },

  GoBackButtonStyle: {
    transform: [{ rotate: '180deg' }],
    width: 50,
    height: 50,
  },


});


export default AddNewToDoScreenMain;