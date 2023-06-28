import { ROLE_TYPE } from "./User.type";
import { PaginationQuery } from "./repository/basic.type";

export type UserRoleUpdate = {
  nickname: string;
  newRole: ROLE_TYPE;
};

export type UserBanRequest = {
  nickname: string;
  description: string;
};

export type UserListQuery = PaginationQuery & {
  roles: ROLE_TYPE[];
  query: string;
};
