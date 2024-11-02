import Language from "@/models/Language";

const Languages: Language[] = [
  {
    name: "English",
    img: require("@/assets/images/united-states-flag.png"),
    code: "en",
    language: "en-US",
  },
  {
    name: "Tiếng Việt",
    img: require("@/assets/images/vietnam-flag.png"),
    code: "vi",
    language: "vi-VN",
  },
  {
    name: "한글",
    img: require("@/assets/images/korean-flag.png"),
    code: "ko",
    language: "ko-KR",
  },
];

export default Languages;
