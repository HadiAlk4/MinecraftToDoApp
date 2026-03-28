
const SaveToDo = async(key, value) => {
    try {

        const jasonValue = JSON.stringify(value)
        await AsyncStorage.setItem(key, jasonValue);
    } catch (e) {

    }
};


const LoadToDo = async(key) => {
    try {
        const jasonValue = await AsyncStorage.getItem(key);
        return jasonValue != null ? JSON.parse(jasonValue) : null;
    } catch (e){

    }
};


const DeleteToDo = async(key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (e) {

    }
};