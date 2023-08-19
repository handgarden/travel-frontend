import { StoreFileName } from "./File.type";
import { PaginationQuery } from "./repository/basic.type";

export type DescriptionForm = {
  destinationId: number;
  content: string;
  storeFileNames: StoreFileName[];
};

export type DescriptionUpdateForm = {
  content: string;
  storeFileNames: StoreFileName[];
};

// export type DescriptionImageType = {
//   id: number;
//   descriptionId: number;
//   storeFileName: StoreFileName;
// };

export type DescriptionType = {
  id: number;
  creatorNickname: string;
  content: string;
  images: StoreFileName[];
  createdAt: string;
  updatedAt: string;
};

export type DescriptionQuery = PaginationQuery & {
  destination: number;
};
