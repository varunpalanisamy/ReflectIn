// app/(tabs)/chat.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { scheduleLocalNotification, cancelAllNotifications } from "@/app/NotificationsManager";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const notificationTimer = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    registerForPushNotificationsAsync();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const { body } = notification.request.content;
      if (body) {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: "bot", text: body }]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const notifBody = response.notification.request.content.body || "";
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
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert("Failed to get push token for notifications!");
        return;
      }
    } else {
      Alert.alert("Must use physical device for notifications");
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return;
    const messageToSend = input;
    setInput("");
    Keyboard.dismiss();

    // Cancel any pending notifications
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
      await cancelAllNotifications();
    }

    // Add user's message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: messageToSend,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch("http://10.0.0.208:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: messageToSend }),
      });
      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data.bot_reply,
      };
      setMessages(prev => [...prev, botMessage]);
      flatListRef.current?.scrollToEnd({ animated: true });

      // Set up delayed notification logic...
      // (same code you already have)
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender === "user" ? styles.userMessage : styles.botMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Vent :)"
          placeholderTextColor="#FFF1DE"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={!input.trim()}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF1DE",
  },
  chatContainer: {
    padding: 12,
    paddingBottom: 60,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: "80%",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#1A1A1A",
    fontWeight: "bold",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#1A1A1A",
    fontWeight: "bold",
  },
  messageText: {
    color: "#FFF1DE",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#FFF1DE",
    borderTopWidth: 0,
    fontWeight: "bold",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    color: "#FFF1DE",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
    fontWeight: "bold",
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 45,
  },
  sendButtonText: {
    color: "#FFF1DE",
    fontWeight: "bold",
  },
});
