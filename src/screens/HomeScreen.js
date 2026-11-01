import React, { useState, useCallback, useLayoutEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  FlatList,
} from 'react-native';
import ImageBackground from '../components/FillImageBackground';
import { LoadToDo, SaveToDo } from '../helperfunctions/StorageHelper';
import { notify } from '../helperfunctions/notify';
import { isDemoEventId } from '../calendar/demoCalendar';
import { formatDueLabel } from '../calendar/eventPayload';
import { useGoogleCalendar } from '../calendar/GoogleCalendarProvider';




const ToDoItems = ({ item, onDelete, onToggleComplete }) => {

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View
      style={styles.ToDoItemsContainer}
    >

      <View style={styles.CaretWrapper}>
      <ExplandButton 
      isExpanded={isExpanded}
      onPress={() => setIsExpanded(!isExpanded)}
      > </ExplandButton>
      </View>
      <Text style={[styles.ToDoItems, {color: item.isFinished ? '#888' : 'black', textDecorationLine: item.isFinished ? 'line-through' : 'none'}]}>{item.title}</Text>
      {!!formatDueLabel(item.dueDate, item.dueTime) && (
        <Text style={styles.DueText}>Due {formatDueLabel(item.dueDate, item.dueTime)}</Text>
      )}
      {!!item.calendarEventId && (
        <Text style={styles.CalendarBadge}>
          {isDemoEventId(item.calendarEventId) ? 'On calendar' : 'On Google Calendar'}
        </Text>
      )}

      {isExpanded && (
        <View style={styles.ExpandedContent}>
          <Text style={styles.DescriptionText}>{item.description}</Text>

          <View style={styles.TickContent}>
            <TouchableOpacity onPress={() => onDelete(item.id)}> 
              <Image
              source={require('../assets/images/DeleteCheckmark.png')} 
              style={styles.actionIcon}
              >

              </Image>
            </TouchableOpacity>

            {!item.isFinished && (
              <TouchableOpacity onPress={() => onToggleComplete(item.id)}>
                <Image
                source={require('../assets/images/Checkmark.png')} 
                style={styles.actionIcon}
                />
              </TouchableOpacity>
            )}

          </View>
        </View>
      )}


    </View>
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Calendar')}
          style={{ paddingRight: 12 }}
        >
          <Text style={{ fontFamily: 'Pixelpurl', fontSize: 20, color: 'black' }}>Calendar</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const getCatMood = () => {
    return ToDos.length > 2 
    ? require('../assets/catGifs/catMood2.gif') : require ('../assets/catGifs/catMood1.gif');
  }


  const ToDoButtonPress = () => {
    navigation.navigate('AddToDo');;
  };

  const [ToDos, SetToDos] = useState([]);
  const { removeEvent } = useGoogleCalendar();

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



  const handleDelete = async (id) => {
    const target = ToDos.find(todo => todo.id === id);
    const updatedList = ToDos.filter(todo => todo.id !== id);
    await SaveToDo('myToDos', updatedList);
    SetToDos(updatedList);

    if (target?.calendarEventId) {
      try {
        await removeEvent(target.calendarEventId);
      } catch (error) {
        notify(
          'Removed from the list',
          error.message || 'The Google Calendar event is still on your calendar.',
        );
      }
    }
  }

  const handleToggleComplete = async (id) => {
    const updatedList = ToDos.map(todo => {
      if(todo.id === id){
        return {...todo, isFinished: true};
      }
      return todo;
    });

    await SaveToDo('myToDos', updatedList);
    SetToDos(updatedList);
  }


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
        

        <FlatList
          data={ToDos}
          style={{ width: '100%', flex: 1 }}
          contentContainerStyle={{ alignItems: 'center' }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ToDoItems 
            item={item}
            onDelete={handleDelete} 
            onToggleComplete={handleToggleComplete}
            />
          )}
        />

      </ImageBackground>

      <ImageBackground
        source={require('../assets/images/bottombkg.jpg')}
        resizeMode="cover"
        style={styles.BottomDisplay}
      >
        <Image source={getCatMood()} style={styles.catMoodStyle} />

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
    width: '80%',
    borderRadius: 10,
  },

  DueText: {
    fontFamily: 'Pixelpurl',
    fontSize: 14,
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },

  CalendarBadge: {
    fontFamily: 'Pixelpurl',
    fontSize: 14,
    color: '#3F51B5',
    marginTop: 2,
    textAlign: 'center',
  },
  ToDoItemsContainer: {
    width: 330,             
    backgroundColor: '#F4EBD0', 
    borderWidth: 3,           
    borderColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 20,    
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    marginTop: 10,
    alignSelf: 'center',      
  },

  CaretWrapper: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,               
  },
  
  ExpandedContent: {
    padding: 10,
    width: '100%',
    alignItems: 'flex-start',
    borderTopWidth: 1,        
    borderTopColor: 'rgba(0,0,0,0.1)',
    marginTop: 10,
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
  actionIcon: {
    width: 40, 
    height: 40, 
    resizeMode: 'contain' 
  },

  catMoodStyle: {
    width: 90,
    height: 90,
    position: 'absolute',
    top: -85,     
    left: 20,      
    zIndex: 5,
    resizeMode: 'contain',
  },

});

export default MainHomeScreen;
