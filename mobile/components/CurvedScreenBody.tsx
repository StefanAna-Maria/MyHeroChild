import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { useTheme } from "../src/context/ThemeContext";

type CurvedScreenBodyProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function CurvedScreenBody({ children, style }: CurvedScreenBodyProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        s.body,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  body: {
    flex: 1,
    marginTop: -22,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
});
