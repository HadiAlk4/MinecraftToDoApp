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
  <View style={ToDoStyles.ToDoContainer}>

    

      <Text> Title </Text> 
      <TextInput>

      </TextInput>

      <Text> Description </Text> 
      <TextInput>

      </TextInput>

      <GoBackButton label= "back" onPress={GoBackButtonPress} />
      
    

  </View>
  );
};

const ToDoStyles = StyleSheet.create ({

  ToDoContainer: {
    flex: 1,
  },

  TitleTextStyle: {

  },

  TitleTextInputStyle: {

  },

  DescriptionTextStyle: {

  },

  DescriptionTextInputStyle: {

  },

  GoBackButtonStyle: {
    transform: [{ rotate: '180deg' }],
    width: 50,
    height: 50,
  },


});


export default AddNewToDoScreenMain;