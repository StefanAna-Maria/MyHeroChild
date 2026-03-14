import { Modal, View, Image, Pressable } from "react-native";
import { avatars, AvatarType } from "../constants/avatars";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (avatar: AvatarType) => void;
};

export default function AvatarPicker({ visible, onSelect }: Props) {

  const list = Object.keys(avatars) as AvatarType[];

  return (
    <Modal visible={visible} transparent animationType="fade">

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >

        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            width: 220
          }}
        >

          {list.map((key) => (

            <Pressable key={key} onPress={() => onSelect(key)}>

              <Image
                source={avatars[key]}
                style={{
                  width: 60,
                  height: 60,
                  margin: 5
                }}
              />

            </Pressable>

          ))}

        </View>

      </View>

    </Modal>
  );
}