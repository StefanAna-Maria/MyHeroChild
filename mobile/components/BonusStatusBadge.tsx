import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../src/context/ThemeContext";

type BonusState = {
  rewardPoints: number;
  totalTasks: number;
  approvedTasks: number;
  progress: number;
  claimable: boolean;
  claimed: boolean;
  restricted: boolean;
  restrictedUntil?: string | null;
};

type Props = {
  bonus: BonusState;
  onClaim?: () => void;
  compact?: boolean;
};

const SEGMENT_COUNT = 36;

const formatCountdown = (restrictedUntil?: string | null) => {
  if (!restrictedUntil) {
    return null;
  }

  const target = new Date(restrictedUntil).getTime();
  const diff = target - Date.now();

  if (diff <= 0) {
    return null;
  }

  const totalMinutes = Math.ceil(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export default function BonusStatusBadge({ bonus, onClaim, compact = false }: Props) {
  const theme = useTheme();
  const [countdown, setCountdown] = useState<string | null>(() => formatCountdown(bonus.restrictedUntil));

  useEffect(() => {
    setCountdown(formatCountdown(bonus.restrictedUntil));

    if (!bonus.restrictedUntil) {
      return;
    }

    const interval = setInterval(() => {
      setCountdown(formatCountdown(bonus.restrictedUntil));
    }, 30000);

    return () => clearInterval(interval);
  }, [bonus.restrictedUntil]);

  const size = compact ? 54 : 62;
  const iconSize = compact ? 24 : 28;
  const segmentRadius = compact ? 23 : 27;
  const segmentWidth = compact ? 3 : 4;
  const segmentHeight = compact ? 6 : 7;
  const coreSize = size - 18;

  const ringColor = bonus.claimable
    ? "#F5C84C"
    : bonus.restricted
      ? "#A3A3A3"
      : theme.colors.primary;
  const trackColor = bonus.claimable ? "#F7E3A4" : "#D8DEE6";

  const glowStyle = bonus.claimable
    ? {
        shadowColor: "#F5C84C",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        elevation: 8,
      }
    : undefined;

  const filledSegments = Math.max(0, Math.min(SEGMENT_COUNT, Math.round(bonus.progress * SEGMENT_COUNT)));

  const segments = useMemo(
    () =>
      Array.from({ length: SEGMENT_COUNT }, (_, index) => {
        const angle = (Math.PI * 2 * index) / SEGMENT_COUNT - Math.PI / 2;
        const left = size / 2 + Math.cos(angle) * segmentRadius - segmentWidth / 2;
        const top = size / 2 + Math.sin(angle) * segmentRadius - segmentHeight / 2;

        return {
          key: index,
          left,
          top,
          rotate: `${(angle * 180) / Math.PI + 90}deg`,
          active: index < filledSegments,
        };
      }),
    [filledSegments, segmentHeight, segmentRadius, segmentWidth, size]
  );

  return (
    <View style={[s.wrapper, compact && s.wrapperCompact]}>
      <View style={[s.badgeWrap, compact && s.badgeWrapCompact]}>
        <View
          style={[
            s.badge,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: theme.colors.surface,
            },
            glowStyle,
          ]}
        >
          {!bonus.restricted && !bonus.claimed
            ? segments.map((segment) => (
                <View
                  key={segment.key}
                  style={[
                    s.segment,
                    {
                      left: segment.left,
                      top: segment.top,
                      width: segmentWidth,
                      height: segmentHeight,
                      borderRadius: segmentWidth,
                      backgroundColor: segment.active ? ringColor : trackColor,
                      transform: [{ rotate: segment.rotate }],
                    },
                  ]}
                />
              ))
            : null}

          <View
            style={[
              s.iconCore,
              {
                width: coreSize,
                height: coreSize,
                borderRadius: coreSize / 2,
                backgroundColor:
                  bonus.claimed
                    ? "#E6F7EA"
                    : bonus.restricted
                      ? "#C8CDD3"
                      : bonus.claimable
                        ? "#FFF9D6"
                        : theme.colors.surfaceAlt,
              },
            ]}
          >
            <Image
              source={require("../assets/icons/bonus.png")}
              style={{ width: iconSize, height: iconSize, resizeMode: "contain" }}
            />

            {bonus.restricted ? (
              <View style={s.restrictedOverlay}>
                <Image
                  source={require("../assets/icons/restricted.png")}
                  style={s.restrictedIcon}
                />
              </View>
            ) : null}

            {bonus.claimed ? (
              <View style={s.claimedOverlay}>
                <Image
                  source={require("../assets/icons/check-mark.png")}
                  style={s.claimedIcon}
                />
              </View>
            ) : null}
          </View>
        </View>

        {bonus.restricted && countdown ? (
          <Text style={[s.countdownText, { color: theme.colors.textMuted }]}>{countdown}</Text>
        ) : null}
      </View>

      {bonus.claimable && !bonus.claimed && onClaim ? (
        <Pressable onPress={onClaim} style={[s.bubble, { backgroundColor: "#F5C84C" }]}>
          <Text style={s.bubbleText}>Claim</Text>
        </Pressable>
      ) : null}

    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 4,
  },
  wrapperCompact: {
    gap: 2,
  },
  badgeWrap: {
    alignItems: "center",
    gap: 4,
  },
  badgeWrapCompact: {
    gap: 2,
  },
  badge: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  segment: {
    position: "absolute",
  },
  iconCore: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  restrictedOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(200,205,211,0.18)",
  },
  restrictedIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  claimedOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(76, 175, 80, 0.18)",
  },
  claimedIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  countdownText: {
    fontSize: 11,
    fontWeight: "700",
  },
  bubble: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bubbleText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
});
