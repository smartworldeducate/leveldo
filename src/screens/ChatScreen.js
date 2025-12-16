import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import { Send, Camera, X } from 'lucide-react-native';

/* ---------- Cloudinary Config ---------- */
const CLOUDINARY_UPLOAD_PRESET = 'profile_image';
const CLOUDINARY_CLOUD_NAME = 'dejuhbel3';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const uploadImageToCloudinary = async (uri) => {
  try {
    const data = new FormData();
    const fileUri = Platform.OS === 'android' && !uri.startsWith('file://') ? 'file://' + uri : uri;

    data.append('file', { uri: fileUri, type: 'image/jpeg', name: 'chat.jpg' });
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: data });
    const result = await res.json();

    if (result?.secure_url) return result.secure_url;
    throw new Error(result?.error?.message || 'Image upload failed');
  } catch (error) {
    throw new Error(error.message || 'Cloudinary upload failed');
  }
};

/* ---------- Format Time ---------- */
const formatTime = (date) => (date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

/* ---------- Message Bubble ---------- */
const MessageItem = ({ item, isMe }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={[styles.msgContainer, isMe ? styles.meContainer : styles.otherContainer]}>
        {!isMe && <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/300' }} style={styles.avatar} />}
        <View style={[styles.msgBubble, isMe ? styles.meBubble : styles.otherBubble]}>
          {item.image && <Image source={{ uri: item.image }} style={{ width: 180, height: 180, borderRadius: 12, marginBottom: item.text ? 6 : 0 }} />}
          {item.text && <Text style={[styles.msgText, isMe && styles.meText]}>{item.text}</Text>}
          {item.createdAt?.toDate && <Text style={styles.timestamp}>{formatTime(item.createdAt.toDate())}</Text>}
        </View>
      </View>
    </Animated.View>
  );
};

/* ---------- ChatScreen ---------- */
export default function ChatScreen({ route }) {
  const { chatId, participants } = route.params; // participants: [user1Id, user2Id]
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));

      // Ensure chat document exists
      const chatRef = firestore().collection('chats').doc(chatId);
      const chatSnap = await chatRef.get();
      if (!chatSnap.exists) {
        await chatRef.set({
          participants: participants || [],
          createdAt: firestore.FieldValue.serverTimestamp(),
          lastMessage: '',
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      }

      // Real-time listener for both sides
      const unsubscribe = chatRef
        .collection('messages')
        .orderBy('createdAt', 'asc')
        .onSnapshot((snap) => {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setMessages(data);
        });

      return () => unsubscribe();
    };

    init();
  }, [chatId]);

  const sendMessage = async () => {
    if (!text.trim() && !selectedImage) return;

    const chatRef = firestore().collection('chats').doc(chatId);
    let imageUrl = null;

    if (selectedImage) {
      try {
        imageUrl = await uploadImageToCloudinary(selectedImage);
      } catch (err) {
        Alert.alert('Upload Error', err.message || 'Failed to upload image');
        return;
      }
    }

    const payload = {
      text: text.trim(),
      image: imageUrl,
      senderId: user.uid,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    try {
      await chatRef.collection('messages').add(payload);
      await chatRef.update({
        lastMessage: text.trim() || '📷 Image',
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      setText('');
      setSelectedImage(null);
    } catch (err) {
      console.log('Send message error:', err.message);
    }
  };

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({ width: 400, height: 400, cropping: true, compressImageQuality: 0.8 });
      setSelectedImage(image.path);
    } catch (err) {
      if (err?.code !== 'E_PICKER_CANCELLED') Alert.alert('Image Error', err.message || String(err));
    }
  };

  const openCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({ width: 400, height: 400, cropping: true, compressImageQuality: 0.8 });
      setSelectedImage(image.path);
    } catch (err) {
      if (err?.code !== 'E_PICKER_CANCELLED') Alert.alert('Camera Error', err.message || String(err));
    }
  };

  const handleImageOption = () => {
    Alert.alert('Send Image', 'Choose an option', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <StatusBar translucent barStyle="dark-content" backgroundColor="transparent" />
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageItem item={item} isMe={item.senderId === user?.uid} />}
        contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeImageBtn}>
            <X size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity onPress={handleImageOption} style={styles.cameraBtn}>
          <Camera size={22} color="#4CAF50" />
        </TouchableOpacity>

        <TextInput value={text} onChangeText={setText} style={styles.input} placeholder="Type a message…" multiline />

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Send size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f6f7' },
  msgContainer: { marginVertical: 6, flexDirection: 'row', alignItems: 'flex-end' },
  meContainer: { justifyContent: 'flex-end' },
  otherContainer: { justifyContent: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  msgBubble: { maxWidth: '75%', padding: 12, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  meBubble: { backgroundColor: '#4CAF50', borderTopRightRadius: 4 },
  otherBubble: { backgroundColor: '#fff', borderTopLeftRadius: 4 },
  msgText: { fontSize: 16, color: '#2B2B2B' },
  meText: { color: '#fff' },
  timestamp: { fontSize: 10, color: '#888', alignSelf: 'flex-end', marginTop: 4 },
  inputRow: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 0.5, borderColor: '#ddd' },
  input: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 120 },
  sendBtn: { backgroundColor: '#4CAF50', borderRadius: 24, padding: 12, marginLeft: 8, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  cameraBtn: { backgroundColor: '#fff', borderRadius: 24, padding: 10, marginRight: 8, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  imagePreviewContainer: { flexDirection: 'row', alignItems: 'center', padding: 8, marginHorizontal: 10, marginBottom: 6, backgroundColor: '#f2f2f2', borderRadius: 12, position: 'relative' },
  imagePreview: { width: 80, height: 80, borderRadius: 12 },
  removeImageBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: '#4CAF50', borderRadius: 12, padding: 4 },
});
