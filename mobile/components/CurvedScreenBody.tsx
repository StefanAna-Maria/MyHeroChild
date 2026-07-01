import { ReactNode } from "react";
import { ImageBackground, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { useTheme } from "../src/context/ThemeContext";

type CurvedScreenBodyProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function CurvedScreenBody({ children, style }: CurvedScreenBodyProps) {
  const theme = useTheme();
  const isChildTheme = theme.role === "CHILD";

  return (
    <View
      style={[
        s.body,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      {isChildTheme ? (
        <ImageBackground
          source={require("../assets/backgrounds/childGeneral.png")}
          resizeMode="cover"
          style={s.childBackground}
          imageStyle={s.childBackgroundImage}
        >
          <View style={s.childOverlay}>{children}</View>
        </ImageBackground>
      ) : (
        children
      )}
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
  childBackground: {
    flex: 1,
  },
  childBackgroundImage: {
    opacity: 0.38,
  },
  childOverlay: {
    flex: 1,
    backgroundColor: "rgba(255, 247, 237, 0.62)",
  },
});
