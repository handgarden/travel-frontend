import { CategoryObj, CategoryType } from "../lib/const/category";
import { MemberBasicProfile } from "./User.type";
import { PaginationResponse } from "./repository/basic.type";

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
  images: PaginationResponse<string>;
  createdAt: string;
  updatedAt: string;
  creator: MemberBasicProfile;
};

export type DestinationType = DestinationInfoType & {
  images: PaginationResponse<string>;
  createdAt: string;
  updatedAt: string;
  creator: MemberBasicProfile;
};
