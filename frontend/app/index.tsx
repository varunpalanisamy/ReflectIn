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
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useNavigation } from "@react-navigation/native";
import {
  scheduleLocalNotification,
  cancelAllNotifications,
} from "./NotificationsManager";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const notificationTimer = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    registerForPushNotificationsAsync();

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { body } = notification.request.content;
        if (body) {
          const botMessage: Message = {
            id: Date.now().toString(),
            sender: "bot",
            text: body,
          };
          setMessages((prev) => [botMessage, ...prev]);
        }
      }
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notifData = response.notification.request.content;
        const notifBody = notifData.body || "";
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
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
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

    // Capture the current input value
    const messageToSend = input;

    // Immediately clear the text input
    setInput("");

    // Cancel any pending notifications if the user sends a new message
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
      await cancelAllNotifications();
    }

    // Append the user's message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: messageToSend,
    };
    setMessages((prev) => [userMessage, ...prev]);

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
      setMessages((prev) => [botMessage, ...prev]);

      // Start the notification timer: if no new message arrives within 15 seconds, schedule notifications.
      notificationTimer.current = setTimeout(async () => {
        await scheduleLocalNotification(
          0,
          "ReflectIn would love to know: How are you feeling now?"
        );
        await scheduleLocalNotification(
          10,
          "ReflectIn: Just checking in—how are you feeling?"
        );
      }, 15000); // 15 seconds
    } catch (error) {
      console.error("Error sending message:", error);
    }

    Keyboard.dismiss();
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user" ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "bot" && styles.botMessageText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust this value as needed
    >
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
    backgroundColor: "#222021",
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
    alignSelf: 'flex-end',
    backgroundColor: '#4313FE'  // Vibrant purple for user
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#9161e8'  // Dusty rose for bot
  },
  messageText: {
    color: '#fff',  // default text color for user messages
    fontSize: 16
  },
  botMessageText: {
    color: '#fff' // Light lavender text for bot messages (stands out on dusty rose)
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#222021', // pastel purple for input container
    borderTopWidth: 1,
    borderColor: '#ccc'
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    backgroundColor: '#D3C7FF', // light lavender for text input
    color: '#000'               // black text inside the text input
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#4313FE', // vibrant purple for send button
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 45
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
