export type CategoryObj = {
  id: number;
  kr: string;
  type: CategoryType;
};

const ACCOMMODATION: CategoryObj = {
  id: 1,
  kr: "숙소",
  type: "ACCOMMODATION",
};

const RESTAURANT: CategoryObj = {
  id: 2,
  kr: "식당",
  type: "RESTAURANT",
};

const ENJOYMENT: CategoryObj = {
  id: 3,
  kr: "즐길거리",
  type: "ENJOYMENT",
};

const ETC: CategoryObj = {
  id: 4,
  kr: "나머지",
  type: "ETC",
};

export type CategoryType = "ACCOMMODATION" | "RESTAURANT" | "ENJOYMENT" | "ETC";

type Category = {
  [key in CategoryType]: CategoryObj;
};

export const CATEGORY: Category = {
  ACCOMMODATION,
  RESTAURANT,
  ENJOYMENT,
  ETC,
};

export const getCategoryColor = (category: CategoryObj) => {
  switch (category.id) {
    case CATEGORY.ACCOMMODATION.id:
      return "red";
    case CATEGORY.RESTAURANT.id:
      return "green";
    case CATEGORY.ENJOYMENT.id:
      return "purple";
    default:
      return "blue";
  }
};

export const convertCategory = (type: CategoryType) => CATEGORY[type];

type ObjectWithCategory = {
  category: CategoryType;
};

export const convertObjectIncludeCategory = <T extends ObjectWithCategory>(
  d: T
) => ({
  ...d,
  category: convertCategory(d.category),
});
