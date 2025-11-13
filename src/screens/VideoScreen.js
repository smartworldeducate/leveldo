import React from 'react';
import { StyleSheet, View } from 'react-native';
import Video from 'react-native-video';
const VideoScreen = () => {
  return (
    <View style={styles.container}>
      <Video
        source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }} // URL or local file
        style={styles.video}
        controls={true}  // shows default play/pause/seek controls
        resizeMode="contain" // 'cover', 'stretch', 'contain'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 200,
  },
});

export default VideoScreen;
