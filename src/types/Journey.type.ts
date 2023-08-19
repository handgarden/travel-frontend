import { convertObjectIncludeCategory } from "../lib/const/category";
import { DescriptionType } from "./Description.type";
import {
  DestinationInfoResponse,
  DestinationInfoType,
} from "./Destination.type";
import { MemberBasicProfile } from "./User.type";

export const jouryneyContentResponseConverter = (
  j: JourneyContentResponse
) => ({
  ...j,
  destination: convertObjectIncludeCategory(j.destination),
});

export const journeyResponseConverter = (d: JourneyResponse) => ({
  ...d,
  journeyContents: d.journeyContents.map((j) => ({
    ...j,
    destination: convertObjectIncludeCategory(j.destination),
  })),
});

export type JourneyContentResponse = {
  destination: DestinationInfoResponse;
  description: DescriptionType;
};

export type JourneyContentType = {
  destination: DestinationInfoType;
  description: DescriptionType;
};

export type JourneyForm = {
  title: string;
  review: string;
  contents: number[];
};

type JourneyBase = {
  id: number;
  creatorNickname: string;
  title: string;
  review: string;
  createdAt: string;
  updatedAt: string;
};

export type JourneyResponse = JourneyBase & {
  journeyContents: JourneyContentResponse[];
};

export type JourneyType = JourneyBase & {
  journeyContents: JourneyContentType[];
};

export type JourneyCommentForm = {
  comment: string;
};

export type JourneyCommentUpdateForm = {
  comment: string;
};

export type JourneyCommentType = {
  id: number;
  creator: MemberBasicProfile;
  content: string;
  createdAt: string;
  updatedAt: string;
};
