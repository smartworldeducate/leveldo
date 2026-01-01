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
  StatusBar,
  Pressable,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import { Send, Camera, X, CheckCheck } from 'lucide-react-native';

/* ================= DESIGN SYSTEM ================= */
const COLORS = {
  primary: '#22C55E',
  background: '#EEF2F5',
  surface: '#FFFFFF',
  bubbleMe: '#22C55E',
  bubbleOther: '#FFFFFF',
  textDark: '#111827',
  textLight: '#FFFFFF',
  muted: '#6B7280',
  inputBg: '#F1F5F9',
};

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

/* ================= HELPERS ================= */
const formatTime = (date) =>
  date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

/* ================= MESSAGE ITEM ================= */
const MessageItem = ({ item, isMe }) => {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fade }}>
      <View
        style={[
          styles.msgRow,
          isMe ? styles.rowRight : styles.rowLeft,
        ]}
      >
        <View
          style={[
            styles.msgBubble,
            isMe ? styles.meBubble : styles.otherBubble,
          ]}
        >
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.imageMsg} />
          )}

          {item.text ? (
            <Text style={[styles.msgText, isMe && styles.meText]}>
              {item.text}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={styles.time}>
              {formatTime(item.createdAt?.toDate?.())}
            </Text>

            {isMe && (
              <CheckCheck
                size={14}
                color={item.seen ? '#16A34A' : COLORS.muted}
              />
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

/* ================= CHAT SCREEN ================= */
export default function ChatScreen({ route }) {
  const { chatId } = route.params;

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const flatListRef = useRef(null);
  const chatRef = firestore().collection('chats').doc(chatId);

  /* ---------- LOAD USER ---------- */
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    })();
  }, []);

  /* ---------- LISTEN ---------- */
  useEffect(() => {
    if (!user) return;

    const unsub = chatRef
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot((snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setMessages(data);

        snap.docs.forEach((doc) => {
          const msg = doc.data();
          if (msg.senderId !== user.uid && !msg.seen) {
            doc.ref.update({ seen: true });
          }
        });
      });

    return unsub;
  }, [user]);

  /* ---------- SEND ---------- */
  const sendMessage = async () => {
    if (!text.trim() && !selectedImage) return;

    await chatRef.collection('messages').add({
      text: text.trim(),
      image: selectedImage || null,
      senderId: user.uid,
      createdAt: firestore.FieldValue.serverTimestamp(),
      seen: false,
    });

    setText('');
    setSelectedImage(null);
  };

  /* ---------- IMAGE ---------- */
  const pickImage = async () => {
    const img = await ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
    });
    setSelectedImage(img.path);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <MessageItem
            item={item}
            isMe={item.senderId === user?.uid}
          />
        )}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* IMAGE PREVIEW */}
      {selectedImage && (
        <View style={styles.previewCard}>
          <Image source={{ uri: selectedImage }} style={styles.previewImg} />
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => setSelectedImage(null)}
          >
            <X size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* INPUT */}
      <View style={styles.inputRow}>
        <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
          <Camera size={22} color={COLORS.primary} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          placeholderTextColor={COLORS.muted}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            { opacity: text.trim() || selectedImage ? 1 : 0.4 },
          ]}
          onPress={sendMessage}
          disabled={!text.trim() && !selectedImage}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  listContent: {
    padding: 14,
    paddingBottom: 24,
  },

  msgRow: {
    marginVertical: 6,
    flexDirection: 'row',
  },

  rowRight: {
    justifyContent: 'flex-end',
  },

  rowLeft: {
    justifyContent: 'flex-start',
  },

  msgBubble: {
    maxWidth: '78%',
    padding: 12,
    borderRadius: 18,
    ...SHADOW,
  },

  meBubble: {
    backgroundColor: COLORS.bubbleMe,
    borderBottomRightRadius: 4,
  },

  otherBubble: {
    backgroundColor: COLORS.bubbleOther,
    borderBottomLeftRadius: 4,
  },

  msgText: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textDark,
  },

  meText: {
    color: COLORS.textLight,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 4,
  },

  time: {
    fontSize: 11,
    color: COLORS.muted,
  },

  imageMsg: {
    width: 200,
    height: 200,
    borderRadius: 14,
    marginBottom: 8,
  },

  /* INPUT */
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  input: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 16,
    maxHeight: 120,
  },

  iconBtn: {
    padding: 8,
  },

  sendBtn: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 24,
  },

  /* IMAGE PREVIEW */
  previewCard: {
    marginHorizontal: 14,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOW,
  },

  previewImg: {
    width: '100%',
    height: 180,
  },

  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 6,
  },
});
