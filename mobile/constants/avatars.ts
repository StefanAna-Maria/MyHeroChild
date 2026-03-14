export const avatars = {
  robot: require("../assets/avatars/robot.png"),
  dragon: require("../assets/avatars/dragon.png"),
  cat: require("../assets/avatars/cat.png"),
  panda: require("../assets/avatars/panda.png"),
  fox: require("../assets/avatars/fox.png"),
  unicorn: require("../assets/avatars/unicorn.png"),
} as const;

export type AvatarType = keyof typeof avatars;