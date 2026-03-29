import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';

import { SaveToDo, LoadToDo } from '../helperfunctions/StorageHelper';

function AddToDoObject (id, title, description, isFinished) {
  this.id = id;
  this.title = title;
  this.description = description;
  this.isFinished = isFinished;
}



const SaveButton = ({label, onPress}) => {
  return (

    <TouchableOpacity onPress ={onPress}>

      <ImageBackground style={ToDoStyles.GoBackAndSaveButtonStyle} source={require('../assets/images/bookmark.png')} >


      </ImageBackground>

    </TouchableOpacity>
  )
}



const GoBackButton = ({label, onPress}) => {

  return (
    <TouchableOpacity onPress ={onPress}>

      <ImageBackground style={ToDoStyles.GoBackAndSaveButtonStyle} source={require('../assets/images/GoBackButton.png')} >


      </ImageBackground>


    </TouchableOpacity>
  )
}

const AddNewToDoScreenMain = ({navigation}) => {

  const GoBackButtonPress = () => {
    navigation.goBack();
  }

  const SaveButtonPress = async () => {

    if(titleText == '' || descText == ''){
      Alert.alert("Fields Cannot be Empty")
    } else {
      const ToDo = new AddToDoObject (
        Date.now().toString(),
        titleText,
        descText,
        false
      );
      Alert.alert("Save Button Clicked");
      

      const prevToDos  = await LoadToDo('myToDos') || [];

      const updatedToDo = [...prevToDos, ToDo];

      await SaveToDo('myToDos', updatedToDo); 
      
      setDescText('');
      setTitleText('');
    }
  }

  const [titleText, setTitleText] = useState('');
  const [descText, setDescText] = useState('');
  const [descHeight, setDescHeight] = useState(50);

  const CHARS_PER_LINE = 29; 
  const LINE_HEIGHT = 18;

  const handleDescChange = (text) => {
    setDescText(text);
    
    const lines = text.split('\n');
    
    // Count wrapped lines too
    const totalLines = lines.reduce((count, line) => {
      return count + Math.max(1, Math.ceil(line.length / CHARS_PER_LINE));
    }, 0);

    setDescHeight(50 + (totalLines - 1) * LINE_HEIGHT);
  };

  return (
  <ImageBackground style={ToDoStyles.ToDoContainer} source={require('../assets/images/ScrollBg.png')} resizeMode="stretch">

    

    <Text style={ToDoStyles.TitleTextStyle}> Title </Text> 

    <TextInput 
    style={ToDoStyles.TitleTextInputStyle} 
    placeholder='Enter Title Here'
    value={titleText}
    onChangeText={(text) => setTitleText(text)}
    />


    <Text style={ToDoStyles.DescriptionTextStyle}> Description </Text> 

    <TextInput 
      style={[ToDoStyles.DescriptionTextInputStyle, { height: descHeight }]} 
      placeholder='Enter Description Here' 
      placeholderTextColor="white"
      multiline
      value={descText}
      onChangeText={handleDescChange}
    />
      


    <View style={{ flexDirection: 'row', marginTop: 20, gap: 200, bottom: 200, position: 'absolute' }}>
    
    <View style={{ alignItems: 'center' }}>
      <GoBackButton label="back" onPress={GoBackButtonPress} />
      <Text style={ToDoStyles.ButtonLabelStyle}>Back</Text>
    </View>

    <View style={{ alignItems: 'center' }}>
      <SaveButton label="Save" onPress={SaveButtonPress} />
      <Text style={ToDoStyles.ButtonLabelStyle}>Save</Text>
    </View>

    </View>

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
    textAlign: 'center',
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
    minHeight: 70, 
    width: 250,
    borderColor: "#3F51B5",
    borderWidth: 2, 
    borderRadius: 5, 
    paddingHorizontal: 15,  
    paddingVertical: 10,
    fontSize: 20, 
    backgroundColor: "black",
    color: "white",
  },

  GoBackAndSaveButtonStyle: {
    transform: [{ rotate: '180deg' }],
    width: 70,
    height: 70,
  },

  ButtonLabelStyle: {
  fontFamily: 'Pixelpurl',
  fontSize: 18,
  color: 'black',
  marginTop: 5,
  textAlign: 'center',
},


});


export default AddNewToDoScreenMain;