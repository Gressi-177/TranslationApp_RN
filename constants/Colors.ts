/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "rgba(68, 138, 255, 1)";
const tintColorDark = "#fff";

export const Colors = {
  white: "#fff",
  light: {
    text: "#11181C",
    background: "rgba(255, 251, 254, 1)",
    headerBackground: "rgba(0, 51, 102, 1)",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    headerBackground: "rgba(0, 51, 102, 1)",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
