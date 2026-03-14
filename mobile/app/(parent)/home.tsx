import { View, Text } from "react-native";
import LogoutButton from "../../components/LogoutButton";
import { useTheme } from "../../src/context/ThemeContext";
import AppHeader from "../../components/AppHeader";

export default function ParentHome() {

  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background
      }}
    >

      <AppHeader />

      <LogoutButton />

    </View>
  );
}