export const DUPLICATE_MESSAGE = (target: string) =>
  `중복된 ${target}이 존재합니다.`;

export const SERVER_ERROR_MESSAGE =
  "서버에 문제가 있습니다. 나중에 다시 시도해주세요.";

export const VALIDATION_MESSAGE = (target: string) =>
  `규칙에 맞게 ${target} 작성해주세요.`;

export const WRONG_MESSAGE = (target: string) => `${target} 틀렸습니다.`;
