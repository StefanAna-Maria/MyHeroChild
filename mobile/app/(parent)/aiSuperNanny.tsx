import { useEffect, useMemo, useState } from "react";
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

type ChildSummary = {
  id: number;
  username: string;
};

type ParentProfileResponse = {
  children: ChildSummary[];
};

const parseAssistantSections = (text: string) => {
  const sections = text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sections.length <= 1) {
    return [];
  }

  return sections.map((section) => {
    const [firstLine, ...rest] = section.split("\n");
    const normalizedTitle = firstLine
      .replace(/^\d+\.\s*/, "")
      .replace(/:$/, "")
      .trim();

    return {
      title: normalizedTitle || "Suggestion",
      body: rest.join("\n").trim() || firstLine.trim(),
    };
  });
};

export default function AiSuperNanny() {
  const theme = useTheme();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [selectedChildName, setSelectedChildName] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I am AI SuperNanny. Ask me for task ideas, reward ideas, or gentle recommendations based on your children.",
    },
  ]);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const response = await api.get("/parent/profile");
        const profile: ParentProfileResponse = response.data.data;
        const nextChildren = profile.children ?? [];
        setChildren(nextChildren);
        if (nextChildren.length === 1) {
          setSelectedChildName(nextChildren[0].username);
        }
      } catch {
        setChildren([]);
      }
    };

    loadChildren();
  }, []);

  const quickPrompts = useMemo(() => {
    const childLabel = selectedChildName ?? "my child";

    return [
      `Suggest 3 task ideas for ${childLabel}.`,
      `Suggest 3 rewards that would motivate ${childLabel}.`,
      `Which task types seem too difficult for ${childLabel} right now?`,
      `What should I add next to my catalogue for ${childLabel}?`,
    ];
  }, [selectedChildName]);

  const sendMessage = async (overrideMessage?: string) => {
    const trimmed = (overrideMessage ?? input).trim();
    if (!trimmed || isSending) {
      return;
    }

    const finalMessage =
      selectedChildName && !trimmed.toLowerCase().includes(selectedChildName.toLowerCase())
        ? `This is about ${selectedChildName}. ${trimmed}`
        : trimmed;

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
        message: finalMessage,
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

          {children.length > 0 ? (
            <View style={s.sectionBlock}>
              <Text style={[s.sectionLabel, { color: theme.colors.textMuted }]}>Choose child</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
                <Pressable
                  onPress={() => setSelectedChildName(null)}
                  style={[
                    s.childChip,
                    {
                      backgroundColor: selectedChildName === null
                        ? theme.colors.primary
                        : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.childChipText,
                      { color: selectedChildName === null ? "#FFFFFF" : theme.colors.text },
                    ]}
                  >
                    All children
                  </Text>
                </Pressable>

                {children.map((child) => {
                  const isSelected = selectedChildName === child.username;

                  return (
                    <Pressable
                      key={child.id}
                      onPress={() => setSelectedChildName(child.username)}
                      style={[
                        s.childChip,
                        {
                          backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.childChipText,
                          { color: isSelected ? "#FFFFFF" : theme.colors.text },
                        ]}
                      >
                        {child.username}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <View style={s.sectionBlock}>
            <Text style={[s.sectionLabel, { color: theme.colors.textMuted }]}>Quick suggestions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
              {quickPrompts.map((prompt) => (
                <Pressable
                  key={prompt}
                  onPress={() => sendMessage(prompt)}
                  style={[
                    s.promptChip,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[s.promptChipText, { color: theme.colors.text }]}>{prompt}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            contentContainerStyle={s.messagesWrap}
            style={s.flex}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => {
              const isUser = message.role === "user";
              const sections = isUser ? [] : parseAssistantSections(message.text);

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

                  {!isUser && sections.length > 1 ? (
                    <View style={s.responseCardsWrap}>
                      {sections.map((section) => (
                        <View
                          key={`${message.id}-${section.title}`}
                          style={[
                            s.responseCard,
                            {
                              backgroundColor: theme.colors.surfaceAlt,
                              borderColor: theme.colors.border,
                            },
                          ]}
                        >
                          <Text style={[s.responseCardTitle, { color: theme.colors.text }]}>
                            {section.title}
                          </Text>
                          <Text style={[s.responseCardText, { color: theme.colors.textMuted }]}>
                            {section.body}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
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
              onPress={() => sendMessage()}
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
  sectionBlock: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: {
    gap: 10,
    paddingRight: 12,
  },
  childChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  childChipText: {
    fontSize: 14,
    fontWeight: "800",
  },
  promptChip: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxWidth: 260,
  },
  promptChipText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  messagesWrap: {
    gap: 12,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: "92%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
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
  responseCardsWrap: {
    gap: 10,
  },
  responseCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  responseCardTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  responseCardText: {
    fontSize: 14,
    lineHeight: 21,
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
