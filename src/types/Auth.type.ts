import { MemberBasicProfile } from "./User.type";
export type LoginForm = {
  account: string;
  password: string;
};

export type RegisterData = {
  account: string;
  password: string;
  nickname: string;
};

export type Jwt = string;

export const JWT_KEY = "jwt";

export type LoginResponse = {
  accessToken: Jwt;
  profile: MemberBasicProfile;
};
