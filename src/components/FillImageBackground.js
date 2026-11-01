import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

// On web, react-native-web sizes the background image to the file's pixel
// size unless the container has an explicit width and height, so flex-sized
// backgrounds only cover a corner. Stretching the image to the container
// keeps the background filling it on every platform.
const FillImageBackground = ({ imageStyle, ...props }) => (
  <ImageBackground {...props} imageStyle={[styles.fill, imageStyle]} />
);

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
});

export default FillImageBackground;
