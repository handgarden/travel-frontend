import { Rule } from "antd/es/form";
import { RegPattern } from "../../../types/pattern.type";

const NO_WHITE_SPACE: RegPattern = {
  pattern: /^[\S]+$/g,
  message: "공백을 제거해주세요.",
};

const PASSWORD: RegPattern = {
  pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%])[A-Za-z\d@!%*#?&]+$/,
  message: "문자, 숫자, 특수문자(!, @, #, $, %)를 각 1개 이상 사용해야합니다.",
};

const ACCOUNT: RegPattern = {
  pattern: /^[0-9A-Za-z-_\s]+$/g,
  message: "숫자, 대소문자, -, _ 만 사용 가능합니다.",
};

const NO_SPECIAL_CHAR = {
  pattern: /^(?!.*[{}[\]/?.,;:|)*~`!^\-+<>@#$%&\\=('"]).*/g,
  message: "' _ ' 를 제외한 특수문자는 사용할 수 없습니다.",
};

const formPattern = { NO_WHITE_SPACE, PASSWORD, ACCOUNT };

export const accountRules: Rule[] = [
  { required: true, type: "string", min: 4, max: 20 },
  formPattern.ACCOUNT,
  formPattern.NO_WHITE_SPACE,
];

export const passwordRules: Rule[] = [
  { required: true, type: "string", min: 8, max: 20 },
  formPattern.PASSWORD,
];

export const nicknameRules: Rule[] = [
  { required: true, type: "string", min: 4, max: 20 },
  NO_WHITE_SPACE,
  NO_SPECIAL_CHAR,
];

export const emailRules: Rule[] = [
  { required: true, type: "email", min: 4, max: 50 },
  formPattern.NO_WHITE_SPACE,
];
