import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminPanel() {
  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
      <View>
        <Text>Admin Panel</Text>
        <Text>TEST</Text>
      </View>
    </SafeAreaView>
  );
}