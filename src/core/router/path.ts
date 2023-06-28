import { CATEGORY, CategoryType } from "./../../lib/const/category";

export const userPath = (function () {
  const defaultPath = "/user";

  return {
    USER: defaultPath,
    PROFILE: defaultPath + "/profile",
    DESTINATION: defaultPath + "/destination",
    DESCRIPTION: defaultPath + "/description",
    JOURNEY: defaultPath + "/journey",
    COMMENT: defaultPath + "/comment",
    PAYMENT_METHOD: defaultPath + "/payment",
    ORDER: defaultPath + "/order",
    SALES: defaultPath + "/sales",
  };
})();

export const journeyPath = (function () {
  const defaultPath = "/journey";

  return {
    HOME: defaultPath,
    ADD: defaultPath + "/add",
    EDIT: defaultPath + "/edit",
  };
})();

export const destinationPath = (function () {
  const defaultPath = "/destination";

  const defaulObj = {
    HOME: defaultPath,
    ADD: defaultPath + "/add",
  };

  const categoryPath = Object.entries(CATEGORY).reduce((obj, e) => {
    const type = e[0];
    const categoryobj = e[1];
    return {
      ...obj,
      [type]: defaultPath + "/" + categoryobj.type.toLowerCase(),
    };
  }, {} as { [key in CategoryType]: string });

  const reserveRoomPath = categoryPath.ACCOMMODATION + "/rooms/:id";

  return {
    ...defaulObj,
    ...categoryPath,
    RESERVE_ROOM: reserveRoomPath,
  };
})();

export const authPath = (function () {
  const defaultPath = "/login";

  return {
    LOGIN: defaultPath,
    REGISTER: defaultPath + "/register",
  };
})();
