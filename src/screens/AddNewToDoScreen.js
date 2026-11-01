import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Switch,
} from 'react-native';

import { SaveToDo, LoadToDo } from '../helperfunctions/StorageHelper';
import { notify } from '../helperfunctions/notify';
import { isValidDue } from '../calendar/eventPayload';
import { useGoogleCalendar } from '../calendar/GoogleCalendarProvider';

function AddToDoObject (id, title, description, isFinished, dueDate, dueTime, calendarEventId) {
  this.id = id;
  this.title = title;
  this.description = description;
  this.isFinished = isFinished;
  this.dueDate = dueDate;
  this.dueTime = dueTime;
  this.calendarEventId = calendarEventId;
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

  const { isConnected, isDemo, createEventForTodo } = useGoogleCalendar();

  const GoBackButtonPress = () => {
    navigation.goBack();
  }

  const SaveButtonPress = async () => {

    if(titleText == '' || descText == ''){
      notify('Fields Cannot be Empty')
      return;
    }

    const dueDate = dueDateText.trim();
    const dueTime = dueTimeText.trim();
    const hasDue = dueDate !== '' || dueTime !== '';

    if (hasDue && !isValidDue(dueDate, dueTime)) {
      notify('Check the due date', 'Use YYYY-MM-DD and HH:MM, or leave both blank.');
      return;
    }

    if (addToCalendar && !hasDue) {
      notify('Add a due date', 'Google Calendar needs a date and time.');
      return;
    }

    if (addToCalendar && !isConnected) {
      notify(
        isDemo ? 'Start the demo calendar' : 'Connect Google Calendar',
        isDemo
          ? 'Open Calendar and start the demo, then save again.'
          : 'Open Calendar from the home screen and sign in, then save again.',
      );
      return;
    }

    let calendarEventId = '';
    if (addToCalendar) {
      try {
        const created = await createEventForTodo({
          title: titleText,
          description: descText,
          dueDate,
          dueTime,
        });
        if (!created.id) {
          throw new Error('Google Calendar did not return an event id.');
        }
        calendarEventId = created.id;
      } catch (error) {
        notify('Calendar', error.message || 'Could not create the calendar event.');
        return;
      }
    }

    const ToDo = new AddToDoObject (
      Date.now().toString(),
      titleText,
      descText,
      false,
      dueDate,
      dueTime,
      calendarEventId,
    );

    const prevToDos  = await LoadToDo('myToDos') || [];
    const updatedToDo = [...prevToDos, ToDo];
    await SaveToDo('myToDos', updatedToDo);

    notify(calendarEventId
      ? (isDemo ? 'Saved to your list and the demo calendar' : 'Saved to your list and Google Calendar')
      : 'Saved');
    setDescText('');
    setTitleText('');
    setDueDateText('');
    setDueTimeText('');
    setAddToCalendar(false);
  }

  const [titleText, setTitleText] = useState('');
  const [descText, setDescText] = useState('');
  const [dueDateText, setDueDateText] = useState('');
  const [dueTimeText, setDueTimeText] = useState('');
  const [addToCalendar, setAddToCalendar] = useState(false);
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
    <ScrollView contentContainerStyle={ToDoStyles.FormContent} style={ToDoStyles.FormScroll}>

    <Text style={ToDoStyles.TitleTextStyle}> Title </Text> 

    <TextInput 
    style={ToDoStyles.TitleTextInputStyle} 
    placeholder='Enter Title Here'
    value={titleText}
    onChangeText={(text) => setTitleText(text)}
    />

    <Text style={ToDoStyles.DueLabelStyle}> Due </Text>
    <View style={ToDoStyles.DueRow}>
      <TextInput
        style={ToDoStyles.DueInputStyle}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#bbb"
        value={dueDateText}
        autoCapitalize="none"
        onChangeText={setDueDateText}
      />
      <TextInput
        style={ToDoStyles.DueInputStyle}
        placeholder="HH:MM"
        placeholderTextColor="#bbb"
        value={dueTimeText}
        autoCapitalize="none"
        onChangeText={setDueTimeText}
      />
    </View>

    <View style={ToDoStyles.CalendarRow}>
      <Text style={ToDoStyles.CalendarLabel}>Add to Google Calendar</Text>
      <Switch
        value={addToCalendar}
        onValueChange={setAddToCalendar}
        trackColor={{ false: '#888', true: '#3F51B5' }}
        thumbColor={addToCalendar ? '#F4EBD0' : '#f4f3f4'}
      />
    </View>

    <Text style={ToDoStyles.DescriptionTextStyle}> Description </Text> 

    <TextInput 
      style={[ToDoStyles.DescriptionTextInputStyle, { height: descHeight }]} 
      placeholder='Enter Description Here' 
      placeholderTextColor="white"
      multiline
      value={descText}
      onChangeText={handleDescChange}
    />
      


    <View style={ToDoStyles.ActionRow}>
    
    <View style={{ alignItems: 'center' }}>
      <GoBackButton label="back" onPress={GoBackButtonPress} />
      <Text style={ToDoStyles.ButtonLabelStyle}>Back</Text>
    </View>

    <View style={{ alignItems: 'center' }}>
      <SaveButton label="Save" onPress={SaveButtonPress} />
      <Text style={ToDoStyles.ButtonLabelStyle}>Save</Text>
    </View>

    </View>

    </ScrollView>
  </ImageBackground>
  );
};

const ToDoStyles = StyleSheet.create ({

  ToDoContainer: {
    flex: 1,
    alignItems: 'center',
  },

  FormScroll: {
    flex: 1,
    width: '100%',
  },

  FormContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },

  ActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 28,
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

  DueLabelStyle: {
    fontFamily: 'Pixelpurl',
    fontSize: 36,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },

  DueRow: {
    flexDirection: 'row',
    gap: 8,
  },

  DueInputStyle: {
    fontFamily: 'Pixelpurl',
    height: 46,
    width: 140,
    borderColor: '#3F51B5',
    borderWidth: 2,
    borderRadius: 5,
    paddingHorizontal: 8,
    fontSize: 16,
    backgroundColor: 'black',
    color: 'white',
    textAlign: 'center',
  },

  CalendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },

  CalendarLabel: {
    fontFamily: 'Pixelpurl',
    fontSize: 16,
    color: 'black',
    width: 180,
  },

  DescriptionTextStyle: {
    fontFamily: 'Pixelpurl',
    fontSize: 48,
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