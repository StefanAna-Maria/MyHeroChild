import { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AvatarType, getAvatarSource } from "../constants/avatars";
import { useTheme } from "../src/context/ThemeContext";
import { UserAvatarOption } from "../src/context/UserContext";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (avatar: AvatarType) => Promise<void> | void;
  onClaim: (avatar: AvatarType) => Promise<void> | void;
  currentAvatar?: AvatarType | string;
  options?: UserAvatarOption[];
  placement?: "center" | "left";
};

const defaultOptions: UserAvatarOption[] = [
  { avatar: "panda", minLevel: 1, unlocked: true, claimed: true, selectable: true },
  { avatar: "robot", minLevel: 1, unlocked: true, claimed: true, selectable: true },
  { avatar: "unicorn", minLevel: 1, unlocked: true, claimed: true, selectable: true },
];

export default function AvatarPicker({
  visible,
  onClose,
  onSelect,
  onClaim,
  currentAvatar,
  options,
  placement = "center",
}: Props) {
  const theme = useTheme();
  const [claimingAvatar, setClaimingAvatar] = useState<AvatarType | null>(null);
  const [selectingAvatar, setSelectingAvatar] = useState<AvatarType | null>(null);

  const avatarOptions = useMemo(() => {
    if (options?.length) {
      return options;
    }

    return defaultOptions;
  }, [options]);

  const handleClaim = async (avatar: AvatarType) => {
    try {
      setClaimingAvatar(avatar);
      await onClaim(avatar);
    } finally {
      setClaimingAvatar(null);
    }
  };

  const handleSelect = async (avatar: AvatarType) => {
    try {
      setSelectingAvatar(avatar);
      await onSelect(avatar);
    } finally {
      setSelectingAvatar(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable
          onPress={() => undefined}
          style={[
            s.panel,
            placement === "left" ? s.leftPanel : s.centerPanel,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[s.title, { color: theme.colors.text }]}>Choose Avatar</Text>

          <ScrollView
            style={s.scrollArea}
            contentContainerStyle={s.grid}
            showsVerticalScrollIndicator={false}
          >
            {avatarOptions.map((option) => {
              const avatarKey = option.avatar as AvatarType;
              const isCurrent = currentAvatar === avatarKey;
              const isLocked = !option.unlocked;
              const isClaimable = option.unlocked && !option.claimed;
              const isSelectable = option.selectable;

              return (
                <View key={avatarKey} style={s.itemWrap}>
                  <Pressable
                    disabled={!isSelectable || selectingAvatar === avatarKey}
                    onPress={() => handleSelect(avatarKey)}
                    style={[
                      s.avatarFrame,
                      {
                        borderColor: isCurrent ? theme.colors.primary : theme.colors.border,
                        backgroundColor: theme.colors.surfaceAlt,
                      },
                    ]}
                  >
                    <Image
                      source={getAvatarSource(avatarKey)}
                      style={[
                        s.avatarImage,
                        isLocked && s.lockedAvatarImage,
                      ]}
                    />

                    {isLocked ? (
                      <View style={s.overlay}>
                        <Image
                          source={require("../assets/icons/padlock.png")}
                          style={s.lockIcon}
                        />
                      </View>
                    ) : null}

                    {isClaimable ? (
                      <Pressable
                        onPress={() => handleClaim(avatarKey)}
                        disabled={claimingAvatar === avatarKey}
                        style={[s.claimBadge, { backgroundColor: theme.colors.primary }]}
                      >
                        <Text style={s.claimBadgeText}>
                          {claimingAvatar === avatarKey ? "..." : "Claim"}
                        </Text>
                      </Pressable>
                    ) : null}

                    {isCurrent && isSelectable ? (
                      <View
                        style={[
                          s.selectedBadge,
                          { backgroundColor: theme.colors.tabIconActive },
                        ]}
                      >
                        <Text style={s.selectedBadgeText}>Selected</Text>
                      </View>
                    ) : null}
                  </Pressable>

                  <Text style={[s.unlockText, { color: theme.colors.textMuted }]}>
                    Unlock at level {option.minLevel}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(16, 24, 40, 0.22)",
  },
  panel: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
    width: 270,
    maxHeight: 430,
  },
  centerPanel: {
    top: "50%",
    left: "50%",
    transform: [{ translateX: -130 }, { translateY: -150 }],
  },
  leftPanel: {
    top: 92,
    left: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  scrollArea: {
    maxHeight: 360,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  itemWrap: {
    width: 104,
    gap: 6,
    alignItems: "center",
  },
  avatarFrame: {
    width: 92,
    height: 92,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    resizeMode: "cover",
  },
  lockedAvatarImage: {
    tintColor: "#B3B7C0",
    opacity: 0.4,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255,255,255,0.38)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  claimBadge: {
    position: "absolute",
    bottom: 6,
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  claimBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  selectedBadge: {
    position: "absolute",
    top: 6,
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  unlockText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },
});
