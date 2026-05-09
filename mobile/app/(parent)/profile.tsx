import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AvatarPicker from "../../components/AvatarPicker";
import { avatars, AvatarType } from "../../constants/avatars";
import { getRewardImage } from "../../constants/rewardImages";
import { useAuth } from "../../src/auth/AuthContext";
import { useUser } from "../../src/context/UserContext";
import { useTheme } from "../../src/context/ThemeContext";
import { api } from "../../src/services/api";

type ChildSummary = {
  id: number;
  username: string;
  avatar: AvatarType;
  activeTasksCount: number;
};

type ClaimedRewardSummary = {
  id: number;
  title: string;
  type: string;
  price: number | null;
  childName: string;
  childAvatar: AvatarType;
};

type ParentProfileResponse = {
  username: string;
  email: string;
  avatar: AvatarType;
  children: ChildSummary[];
  claimedRewards: ClaimedRewardSummary[];
};

type ProfileErrors = {
  username?: string;
  email?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const childNicknameStorageKey = (parentUsername: string) =>
  `parent-child-nicknames:${parentUsername}`;

export default function ParentProfile() {
  const theme = useTheme();
  const { login } = useAuth();
  const { refreshUser } = useUser();

  const [profile, setProfile] = useState<ParentProfileResponse | null>(null);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftAvatar, setDraftAvatar] = useState<AvatarType>("robot");
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [childNicknames, setChildNicknames] = useState<Record<number, string>>({});
  const [editingChildId, setEditingChildId] = useState<number | null>(null);
  const [draftChildNickname, setDraftChildNickname] = useState("");

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/parent/profile");
      const nextProfile: ParentProfileResponse = response.data.data;

      setProfile(nextProfile);
      setDraftUsername(nextProfile.username ?? "");
      setDraftEmail(nextProfile.email ?? "");
      setDraftAvatar(nextProfile.avatar ?? "robot");
      setErrors({});
    } catch {
      Alert.alert("Load failed", "The parent profile could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const loadChildNicknames = async () => {
      if (!profile?.username) {
        setChildNicknames({});
        return;
      }

      try {
        const stored = await AsyncStorage.getItem(
          childNicknameStorageKey(profile.username)
        );
        setChildNicknames(stored ? JSON.parse(stored) : {});
      } catch {
        setChildNicknames({});
      }
    };

    loadChildNicknames();
  }, [profile?.username]);

  const validate = () => {
    const nextErrors: ProfileErrors = {};

    if (!draftUsername.trim()) {
      nextErrors.username = "This field is required.";
    }

    if (!draftEmail.trim()) {
      nextErrors.email = "This field is required.";
    } else if (!emailRegex.test(draftEmail.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setIsSaving(true);

      const response = await api.put("/users/me", {
        username: draftUsername.trim(),
        email: draftEmail.trim(),
        avatar: draftAvatar,
      });

      const nextToken: string | undefined = response.data?.data?.token;
      if (nextToken) {
        await login(nextToken);
      }

      await Promise.all([loadProfile(), refreshUser()]);
      setIsEditing(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? "The profile could not be updated.";
      Alert.alert("Save failed", message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    setDraftUsername(profile.username ?? "");
    setDraftEmail(profile.email ?? "");
    setDraftAvatar(profile.avatar ?? "robot");
    setErrors({});
    setIsEditing(false);
  };

  const getDisplayedChildName = (child: ChildSummary | ClaimedRewardSummary) => {
    const nickname = childNicknames[child.id];
    return nickname?.trim() || ("username" in child ? child.username : child.childName);
  };

  const beginChildNicknameEdit = (child: ChildSummary) => {
    setEditingChildId(child.id);
    setDraftChildNickname(childNicknames[child.id] ?? child.username);
  };

  const saveChildNickname = async () => {
    if (!profile || editingChildId === null) {
      return;
    }

    const trimmedNickname = draftChildNickname.trim();
    const nextNicknames = {
      ...childNicknames,
      [editingChildId]: trimmedNickname,
    };

    try {
      await AsyncStorage.setItem(
        childNicknameStorageKey(profile.username),
        JSON.stringify(nextNicknames)
      );
      setChildNicknames(nextNicknames);
      setEditingChildId(null);
      setDraftChildNickname("");
    } catch {
      Alert.alert("Save failed", "The child nickname could not be saved.");
    }
  };

  const cancelChildNicknameEdit = () => {
    setEditingChildId(null);
    setDraftChildNickname("");
  };

  const selectedAvatar = useMemo(
    () => avatars[draftAvatar] ?? avatars.robot,
    [draftAvatar]
  );

  const children = profile?.children ?? [];
  const claimedRewards = profile?.claimedRewards ?? [];

  return (
    <View style={[s.screen, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          s.topBar,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={s.topBarText}>
          <Text style={[s.topBarTitle, { color: theme.colors.text }]}>My Profile</Text>
          <Text style={{ color: theme.colors.textMuted }}>
            Manage your account and view your family overview
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View
          style={[
            s.profileCard,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={s.profileHeader}>
            <Pressable
              onPress={() => isEditing && setAvatarPickerVisible(true)}
              style={s.avatarWrapper}
            >
              <Image source={selectedAvatar} style={s.profileAvatar} />
              {isEditing ? (
                <View
                  style={[
                    s.avatarEditBadge,
                    { backgroundColor: theme.colors.tabIconActive },
                  ]}
                >
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
              ) : null}
            </Pressable>

            <View style={s.profileSummary}>
              {isEditing ? (
                <>
                  <Text style={[s.sectionTitle, { color: theme.colors.text }]}>
                    Parent Account
                  </Text>
                  <Text style={{ color: theme.colors.textMuted }}>
                    Update your username, email and avatar.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[s.sectionTitle, { color: theme.colors.text }]}>
                    {draftUsername}
                  </Text>
                  <Text style={{ color: theme.colors.textMuted }}>{draftEmail}</Text>
                </>
              )}
            </View>

            {!isEditing ? (
              <Pressable
                onPress={() => setIsEditing(true)}
                style={s.profileEditIconButton}
                hitSlop={8}
              >
                <Image
                  source={require("../../assets/button_icons/edit.png")}
                  style={s.actionIcon}
                />
              </Pressable>
            ) : null}
          </View>

          {isEditing ? (
            <>
              <View style={s.fieldGroup}>
                <Text style={[s.fieldLabel, { color: theme.colors.text }]}>Username</Text>
                <TextInput
                  editable={isEditing}
                  value={draftUsername}
                  onChangeText={(value) => {
                    setDraftUsername(value);
                    setErrors((current) => ({ ...current, username: undefined }));
                  }}
                  placeholder="Username"
                  placeholderTextColor={
                    errors.username ? theme.colors.error : theme.colors.textMuted
                  }
                  style={[
                    s.input,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      color: theme.colors.text,
                      borderColor: errors.username ? theme.colors.error : "transparent",
                    },
                  ]}
                />
                {errors.username ? (
                  <Text style={[s.errorText, { color: theme.colors.error }]}>
                    {errors.username}
                  </Text>
                ) : null}
              </View>

              <View style={s.fieldGroup}>
                <Text style={[s.fieldLabel, { color: theme.colors.text }]}>Email</Text>
                <TextInput
                  editable={isEditing}
                  value={draftEmail}
                  onChangeText={(value) => {
                    setDraftEmail(value);
                    setErrors((current) => ({ ...current, email: undefined }));
                  }}
                  placeholder="Email"
                  placeholderTextColor={
                    errors.email ? theme.colors.error : theme.colors.textMuted
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[
                    s.input,
                    {
                      backgroundColor: theme.colors.surfaceAlt,
                      color: theme.colors.text,
                      borderColor: errors.email ? theme.colors.error : "transparent",
                    },
                  ]}
                />
                {errors.email ? (
                  <Text style={[s.errorText, { color: theme.colors.error }]}>
                    {errors.email}
                  </Text>
                ) : null}
              </View>
            </>
          ) : null}

          {isEditing ? (
            <View style={s.actionRow}>
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={[s.primaryButton, { backgroundColor: theme.colors.tabIconActive }]}
              >
                <Text style={s.primaryButtonText}>
                  {isSaving ? "Saving..." : "Save"}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleCancel}
                style={[s.secondaryButton, { backgroundColor: theme.colors.accent }]}
              >
                <Text style={s.primaryButtonText}>Cancel</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: theme.colors.text }]}>
              My Children
            </Text>
            <View style={[s.countBadge, { backgroundColor: theme.colors.tabIconActive }]}>
              <Text style={s.countBadgeText}>{children.length}</Text>
            </View>
          </View>

          {isLoading ? (
            <Text style={{ color: theme.colors.textMuted }}>Loading children...</Text>
          ) : children.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted }}>
              No children are linked to this parent account yet.
            </Text>
          ) : (
            children.map((child) => (
              <View
                key={child.id}
                style={[s.childCard, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                <Image source={avatars[child.avatar] ?? avatars.robot} style={s.childAvatar} />

                <View style={s.childInfo}>
                  {editingChildId === child.id ? (
                    <>
                      <TextInput
                        value={draftChildNickname}
                        onChangeText={setDraftChildNickname}
                        placeholder="Child nickname"
                        placeholderTextColor={theme.colors.textMuted}
                        style={[
                          s.childNicknameInput,
                          {
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.text,
                          },
                        ]}
                      />
                      <View style={s.childEditActions}>
                        <Pressable
                          onPress={saveChildNickname}
                          style={[
                            s.childEditButton,
                            { backgroundColor: theme.colors.tabIconActive },
                          ]}
                        >
                          <Text style={s.childEditButtonText}>Save</Text>
                        </Pressable>
                        <Pressable
                          onPress={cancelChildNicknameEdit}
                          style={[
                            s.childEditButton,
                            { backgroundColor: theme.colors.accent },
                          ]}
                        >
                          <Text style={s.childEditButtonText}>Cancel</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <View style={s.childTitleRow}>
                      <Text style={[s.childName, { color: theme.colors.text }]}>
                        {getDisplayedChildName(child)}
                      </Text>
                      <Pressable
                        onPress={() => beginChildNicknameEdit(child)}
                        style={s.childEditIconButton}
                        hitSlop={8}
                      >
                        <Image
                          source={require("../../assets/button_icons/edit.png")}
                          style={s.smallActionIcon}
                        />
                      </Pressable>
                    </View>
                  )}
                  <Text style={{ color: theme.colors.textMuted }}>
                    Active tasks: {child.activeTasksCount}
                  </Text>
                </View>

                <View
                  style={[s.metricBadge, { backgroundColor: theme.colors.surface }]}
                >
                  <Text style={[s.metricBadgeText, { color: theme.colors.text }]}>
                    {child.activeTasksCount}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View
          style={[
            s.sectionCard,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: theme.colors.text }]}>
              Claimed Rewards
            </Text>
            <View style={[s.countBadge, { backgroundColor: theme.colors.tabIconActive }]}>
              <Text style={s.countBadgeText}>{claimedRewards.length}</Text>
            </View>
          </View>

          {isLoading ? (
            <Text style={{ color: theme.colors.textMuted }}>Loading rewards...</Text>
          ) : claimedRewards.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted }}>
              No claimed rewards have been recorded yet.
            </Text>
          ) : (
            claimedRewards.map((reward) => (
              <View
                key={reward.id}
                style={[s.rewardCard, { backgroundColor: theme.colors.surfaceAlt }]}
              >
                <View style={[s.rewardImageFrame, { backgroundColor: theme.colors.surface }]}>
                  <Image source={getRewardImage(reward.type)} style={s.rewardImage} />
                </View>

                <View style={s.rewardContent}>
                  <Text style={[s.rewardTitle, { color: theme.colors.text }]}>
                    {reward.title}
                  </Text>
                  <Text style={{ color: theme.colors.textMuted }}>
                    Claimed by {getDisplayedChildName(reward)}
                  </Text>
                </View>

                <View style={s.rewardMeta}>
                  <Image
                    source={avatars[reward.childAvatar] ?? avatars.robot}
                    style={s.claimedChildAvatar}
                  />
                  {typeof reward.price === "number" ? (
                    <View style={s.priceRow}>
                      <Text style={[s.priceText, { color: theme.colors.text }]}>
                        {reward.price}
                      </Text>
                      <Image
                        source={require("../../assets/icons/reward_points.png")}
                        style={s.priceIcon}
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <AvatarPicker
        visible={avatarPickerVisible}
        onClose={() => setAvatarPickerVisible(false)}
        onSelect={(avatar) => {
          setDraftAvatar(avatar);
          setAvatarPickerVisible(false);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    paddingTop: 56,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  topBarText: {
    gap: 2,
  },
  topBarTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  profileCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrapper: {
    position: "relative",
  },
  profileAvatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  avatarEditBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  profileSummary: {
    flex: 1,
    gap: 4,
  },
  profileEditIconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  sectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  childCard: {
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  childAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  childInfo: {
    flex: 1,
    gap: 4,
  },
  childTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  childName: {
    fontSize: 18,
    fontWeight: "800",
    flexShrink: 1,
  },
  childEditIconButton: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  childNicknameInput: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  childEditActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  childEditButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  childEditButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  metricBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  metricBadgeText: {
    fontSize: 16,
    fontWeight: "800",
  },
  rewardCard: {
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rewardImageFrame: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  rewardImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    resizeMode: "cover",
  },
  rewardContent: {
    flex: 1,
    gap: 4,
  },
  rewardTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  rewardMeta: {
    alignItems: "flex-end",
    gap: 8,
  },
  claimedChildAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "800",
  },
  priceIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  actionIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  smallActionIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
});
