import { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api } from "../../../../src/services/api";
import { rewardImages, RewardType } from "../../../../constants/rewardImages";

export default function PackageDetail() {

  const { id } = useLocalSearchParams();
  const [pkg, setPkg] = useState<any>(null);

  useEffect(() => {
    api.get(`/packages/${id}`).then(res => setPkg(res.data.data));
  }, []);

  if (!pkg) return null;

  return (
    <ScrollView style={s.container}>

      <Text style={s.title}>{pkg.title}</Text>
      <Text>{pkg.description}</Text>

      <Text style={s.section}>Tasks</Text>

      {pkg.tasks.map((t: any) => (
        <View key={t.id} style={s.box}>
          <Text>{t.title}</Text>
          <Text>{t.xp} XP</Text>
        </View>
      ))}

      <Text style={s.section}>Rewards</Text>

      {pkg.rewards.map((r: any) => {

        const img =
          rewardImages[r.type as RewardType] ??
          rewardImages.default;

        return (
          <View key={r.id} style={s.reward}>
            <Image source={img} style={s.img} />
            <View>
              <Text>{r.title}</Text>
              <Text>{r.price} RP</Text>
            </View>
          </View>
        );
      })}

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "800" },
  section: { marginTop: 20, fontWeight: "700" },
  box: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 10,
    marginTop: 8
  },
  reward: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    alignItems: "center"
  },
  img: {
    width: 50,
    height: 50
  }
});