import { CategoryObj, CategoryType } from "../lib/const/category";
import { PaginationQuery } from "./repository/basic.type";

export type CreateDestinationForm = {
  category: CategoryType;
  title: string;
  address: string;
};

export type UpdateDestinationForm = {
  category: CategoryType;
  title: string;
  address: string;
};

type DestinationInfo = {
  id: number;
  title: string;
  address: string;
};

export type DestinationInfoResponse = DestinationInfo & {
  category: CategoryType;
};

export type DestinationInfoType = DestinationInfo & {
  category: CategoryObj;
};

export type DestinationResponse = DestinationInfoResponse & {
  createdAt: string;
  updatedAt: string;
  creatorNickname: string;
};

export type DestinationType = DestinationInfoType & {
  createdAt: string;
  updatedAt: string;
  creatorNickname: string;
};

export type ItemListQuery = PaginationQuery & {
  category?: CategoryType[];
  query?: string;
};
