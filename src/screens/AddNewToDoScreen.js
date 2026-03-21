import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';


const SaveButton = ({label, onPress}) => {
  return (

    <TouchableOpacity onPress ={onPress}>

      <ImageBackground style={ToDoStyles.GoBackButtonStyle} source={require('../assets/images/bookmark.png')} >


      </ImageBackground>

    </TouchableOpacity>
  )
}


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
    navigation.goBack();
  }

  const SaveButtonPress = () => {
    Alert.alert("Save Button Clicked")
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
      <SaveButton label = "Save" onPress={SaveButtonPress} />
      
    

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
    fontFamily: 'Pixelpurl',
    height: 50, 
    width: 250,
    borderColor: "#3F51B5",
    borderWidth: 2, 
    borderRadius: 5, 
    paddingHorizontal: 15,
    fontSize: 20, 
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
    fontFamily: 'Pixelpurl',
    height: 50, 
    width: 250,
    borderColor: "#3F51B5",
    borderWidth: 2, 
    borderRadius: 5, 
    paddingHorizontal: 15, 
    fontSize: 20, 
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