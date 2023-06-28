export const validationMessages = {
  required: "필수 값 입니다.",
  types: {
    string: "입력 불가능한 문자를 입력하셨습니다.",
    number: "숫자만 입력가능합니다.",
  },
  string: {
    // eslint-disable-next-line no-template-curly-in-string
    range: "최소 ${min}자, 최대 ${max}자 사이로 작성해주세요.",
  },
  number: {
    // eslint-disable-next-line no-template-curly-in-string
    range: "최소 ${min}, 최대 ${max} 사이로 입력해주세요.",
  },
};
