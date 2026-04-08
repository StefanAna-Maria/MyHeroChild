import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { api } from "../../../../src/services/api";
import { useRouter } from "expo-router";

export default function CreatePackage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [description, setDescription] = useState("");

  const [tasks, setTasks] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);

  const addTask = () => {
    setTasks([...tasks, { title: "", xp: 0, rewardPoints: 0, type: "" }]);
  };

  const addReward = () => {
    setRewards([...rewards, { title: "", price: 0, type: "" }]);
  };

  const submit = async () => {
    await api.post("/packages", {
      title,
      ageGroup,
      description,
      tasks,
      rewards
    });

    router.replace("/(admin)/packages");
  };

  return (
    <ScrollView style={s.container}>

      <Text style={s.label}>Package Info</Text>

      <TextInput placeholder="Title" style={s.input} onChangeText={setTitle} />
      <TextInput placeholder="Age Group" style={s.input} onChangeText={setAgeGroup} />
      <TextInput placeholder="Description" style={s.input} onChangeText={setDescription} />

      <Text style={s.label}>Tasks</Text>

      {tasks.map((t, i) => (
        <View key={i} style={s.box}>

          <TextInput
            placeholder="Task title"
            style={s.input}
            onChangeText={(text) => {
              const copy = [...tasks];
              copy[i].title = text;
              setTasks(copy);
            }}
          />

          <TextInput
            placeholder="XP"
            style={s.input}
            keyboardType="numeric"
            onChangeText={(text) => {
              const copy = [...tasks];
              copy[i].xp = Number(text);
              setTasks(copy);
            }}
          />

          <TextInput
            placeholder="Reward Points"
            style={s.input}
            keyboardType="numeric"
            onChangeText={(text) => {
              const copy = [...tasks];
              copy[i].rewardPoints = Number(text);
              setTasks(copy);
            }}
          />

          <TextInput
            placeholder="Type (ex: hygiene)"
            style={s.input}
            onChangeText={(text) => {
              const copy = [...tasks];
              copy[i].type = text;
              setTasks(copy);
            }}
          />

        </View>
      ))}

      <Pressable onPress={addTask}>
        <Text style={s.add}>+ Add Task</Text>
      </Pressable>

      <Text style={s.label}>Rewards</Text>

      {rewards.map((r, i) => (
        <View key={i} style={s.box}>

          <TextInput
            placeholder="Reward title"
            style={s.input}
            onChangeText={(text) => {
              const copy = [...rewards];
              copy[i].title = text;
              setRewards(copy);
            }}
          />

          <TextInput
            placeholder="Price"
            style={s.input}
            keyboardType="numeric"
            onChangeText={(text) => {
              const copy = [...rewards];
              copy[i].price = Number(text);
              setRewards(copy);
            }}
          />

          <TextInput
            placeholder="Type (toy, screen_time...)"
            style={s.input}
            onChangeText={(text) => {
              const copy = [...rewards];
              copy[i].type = text;
              setRewards(copy);
            }}
          />

        </View>
      ))}

      <Pressable onPress={addReward}>
        <Text style={s.add}>+ Add Reward</Text>
      </Pressable>

      <Pressable style={s.submit} onPress={submit}>
        <Text style={{ color: "white" }}>Create Package</Text>
      </Pressable>

    </ScrollView>
  );

    //router.replace("/(admin)/packages");
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },
  label: {
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10
  },
  add: {
    color: "blue",
    marginBottom: 10
  },
  submit: {
    backgroundColor: "#6C63FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20
  },
  box: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8
  }
});