import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useNavigation } from '@react-navigation/native';
import { scheduleLocalNotification, cancelAllNotifications } from './NotificationsManager'; // Adjust the path if needed

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const notificationTimer = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    registerForPushNotificationsAsync();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const { body } = notification.request.content;
      if (body) {
        const botMessage: Message = { id: Date.now().toString(), sender: 'bot', text: body };
        setMessages(prev => [botMessage, ...prev]);
      }
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const notifData = response.notification.request.content;
      const notifBody = notifData.body || '';
      setInput(notifBody);
      Alert.alert("Notification Clicked", notifBody);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
      if (notificationTimer.current) {
        clearTimeout(notificationTimer.current);
      }
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for notifications!');
        return;
      }
    } else {
      Alert.alert('Must use physical device for notifications');
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return;
    // Cancel any pending notifications if the user sends a new message
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
      await cancelAllNotifications();
    }

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [userMessage, ...prev]);

    try {
      const response = await fetch('http://10.0.0.208:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_message: input })
      });
      const data = await response.json();
      const botMessage: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: data.bot_reply };
      setMessages(prev => [botMessage, ...prev]);

      // Start the notification timer: if no new message arrives within 15 seconds, schedule notifications.
      notificationTimer.current = setTimeout(async () => {
        await scheduleLocalNotification(0, "ReflectIn would love to know: How are you feeling now?");
        await scheduleLocalNotification(10, "ReflectIn: Just checking in—how are you feeling?");
      }, 15000); // 15 seconds
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setInput('');
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={styles.chatContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2'
  },
  chatContainer: {
    padding: 10,
    paddingBottom: 50
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '75%',
    borderRadius: 10,
    padding: 10
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0084ff'
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea'
  },
  messageText: {
    color: '#fff'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#ccc'
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 40,
    backgroundColor: '#fff'
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#0084ff',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
