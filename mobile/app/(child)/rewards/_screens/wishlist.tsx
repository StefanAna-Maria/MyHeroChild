import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CurvedScreenBody from "../../../../components/CurvedScreenBody";
import { api } from "../../../../src/services/api";
import { useTheme } from "../../../../src/context/ThemeContext";

type WishlistReward = {
  id: number;
  title: string;
};

type WishlistData = {
  wishlist: WishlistReward[];
  notifications: {
    id: number;
    title: string;
    message: string;
  }[];
};

export default function ChildWishlistScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<WishlistData>({ wishlist: [], notifications: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const lastShownNotificationIds = useRef<number[]>([]);

  const loadWishlist = useCallback(async () => {
    const response = await api.get("/child/rewards");
    const rewards = Array.isArray(response.data.data.wishlist) ? response.data.data.wishlist : [];
    setData({
      wishlist: rewards.map((reward: any) => ({
        id: Number(reward.id),
        title: String(reward.title ?? ""),
      })),
      notifications: response.data.data.notifications ?? [],
    });
  }, []);

  useFocusEffect(useCallback(() => { loadWishlist(); }, [loadWishlist]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadWishlist();
    } finally {
      setRefreshing(false);
    }
  }, [loadWishlist]);

  const saveWish = useCallback(async () => {
    if (!title.trim()) {
      setError("This field is required.");
      return;
    }

    try {
      setIsSaving(true);
      await api.post("/child/rewards/wishlist", { title: title.trim() });
      setModalVisible(false);
      setTitle("");
      setError("");
      await loadWishlist();
    } catch (error: any) {
      Alert.alert("Save failed", error?.response?.data?.message ?? "The wishlist reward could not be created.");
    } finally {
      setIsSaving(false);
    }
  }, [loadWishlist, title]);

  useEffect(() => {
    const unseen = data.notifications.filter((n) => !lastShownNotificationIds.current.includes(n.id));
    if (unseen.length === 0) return;
    lastShownNotificationIds.current = [...lastShownNotificationIds.current, ...unseen.map((n) => n.id)];
    unseen.forEach((n) => Alert.alert(n.title, n.message));
  }, [data.notifications]);

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <ImageBackground
        source={require("../../../../assets/images/ChildAppHeader.png")}
        resizeMode="cover"
        style={[s.header, { paddingTop: insets.top + 14 }]}
      >
        <View style={s.headerTopRow}>
          <Pressable onPress={() => router.back()} style={[s.backButton, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <View style={s.headerTextWrap}>
            <Text style={s.headerTitle}>Wishlist</Text>
          </View>
        </View>
        <View style={s.headerBottomSpacer} />
      </ImageBackground>

      <CurvedScreenBody>
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        >
          <Text style={[s.helperText, { color: theme.colors.textMuted }]}>
            Express your wishes to let your parent know which rewards you would love them to add one day!
          </Text>

          <Pressable onPress={() => setModalVisible(true)} style={[s.newWishButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={s.newWishButtonText}>Make a Wish</Text>
          </Pressable>

          {data.wishlist.length === 0 ? (
            <View style={[s.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[s.emptyTitle, { color: theme.colors.text }]}>No wishes yet</Text>
              <Text style={[s.emptyText, { color: theme.colors.textMuted }]}>
                Add the title of a reward you would like to see in the future.
              </Text>
            </View>
          ) : (
            data.wishlist.map((reward) => (
              <ImageBackground
                key={reward.id}
                source={require("../../../../assets/backgrounds/wishes.png")}
                resizeMode="cover"
                imageStyle={s.wishCardBackgroundImage}
                style={[s.wishCard, { borderColor: theme.colors.border }]}
              >
                <View style={s.wishCardOverlay}>
                  <Text style={[s.wishTitle, { color: theme.colors.text }]}>{reward.title}</Text>
                </View>
              </ImageBackground>
            ))
          )}
        </ScrollView>
      </CurvedScreenBody>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={s.modalBackdrop}>
          <View style={[s.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Pressable onPress={() => setModalVisible(false)} style={s.modalCloseButton} hitSlop={8}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
            <Text style={[s.modalTitle, { color: theme.colors.text }]}>Add to Wishlist</Text>
            <TextInput
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                setError("");
              }}
              placeholder="Reward title"
              placeholderTextColor={error ? theme.colors.error : theme.colors.textMuted}
              style={[
                s.input,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  color: theme.colors.text,
                  borderColor: error ? theme.colors.error : "transparent",
                },
              ]}
            />
            {error ? <Text style={[s.errorText, { color: theme.colors.error }]}>{error}</Text> : null}

            <Pressable onPress={saveWish} disabled={isSaving} style={[s.saveButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={s.saveButtonText}>{isSaving ? "Saving..." : "Save Wish"}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 18 },
  headerTopRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  headerBottomSpacer: { height: 54 },
  backButton: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  headerTextWrap: { flex: 1, gap: 4 },
  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(31, 41, 55, 0.42)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  content: { padding: 16, paddingTop: 28, paddingBottom: 104, gap: 14 },
  helperText: { fontSize: 17, lineHeight: 25, fontWeight: "600" },
  newWishButton: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  newWishButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  emptyCard: { borderRadius: 22, borderWidth: 1, padding: 18, gap: 8 },
  emptyTitle: { fontSize: 20, fontWeight: "800" },
  emptyText: { fontSize: 15, lineHeight: 22 },
  wishCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  wishCardBackgroundImage: { borderRadius: 18 },
  wishCardOverlay: { padding: 16, backgroundColor: "rgba(255,255,255,0.72)" },
  wishTitle: { fontSize: 18, fontWeight: "800" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(16, 24, 40, 0.38)", alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  modalCard: { width: "100%", borderWidth: 1, borderRadius: 22, padding: 20, gap: 14 },
  modalCloseButton: { position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", zIndex: 2 },
  modalTitle: { fontSize: 22, fontWeight: "800", paddingRight: 32 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16 },
  errorText: { marginTop: -6, fontSize: 12, fontWeight: "600" },
  saveButton: { marginTop: 4, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
});
