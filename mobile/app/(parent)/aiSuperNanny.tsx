import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AppHeader from "../../components/AppHeader";
import { api } from "../../src/services/api";
import { useTheme } from "../../src/context/ThemeContext";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

export default function AiSuperNanny() {
  const theme = useTheme();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I am AI SuperNanny. Ask me for task ideas, reward ideas, or gentle recommendations based on your children.",
    },
  ]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await api.post("/parent/ai/chat", {
        message: trimmed,
      });

      const reply = response.data?.data?.reply ?? "I could not generate a response right now.";

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: reply,
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "AI unavailable",
        error?.response?.data?.message ??
          "Could not reach AI SuperNanny. Make sure the backend and Ollama are both running."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.content}>
          <View style={s.headerBlock}>
            <Text style={[s.title, { color: theme.colors.text }]}>AI SuperNanny</Text>
            <Text style={[s.subtitle, { color: theme.colors.textMuted }]}>
              Ask for task and reward recommendations tailored to your family.
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={s.messagesWrap}
            style={s.flex}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <View
                  key={message.id}
                  style={[
                    s.messageBubble,
                    isUser ? s.userBubbleAlign : s.assistantBubbleAlign,
                    {
                      backgroundColor: isUser
                        ? theme.colors.primary
                        : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.messageText,
                      { color: isUser ? "#FFFFFF" : theme.colors.text },
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View
            style={[
              s.inputBar,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask AI SuperNanny for advice..."
              placeholderTextColor={theme.colors.textMuted}
              style={[
                s.input,
                {
                  color: theme.colors.text,
                },
              ]}
              multiline
            />

            <Pressable
              onPress={sendMessage}
              disabled={isSending}
              style={[
                s.sendButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: isSending ? 0.7 : 1,
                },
              ]}
            >
              <Text style={s.sendButtonText}>{isSending ? "..." : "Send"}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 14,
  },
  headerBlock: {
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  messagesWrap: {
    gap: 12,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: "88%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  userBubbleAlign: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 6,
  },
  assistantBubbleAlign: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputBar: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    fontSize: 15,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  sendButton: {
    minWidth: 72,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});
