import {
  Role,
  RoleAdmin,
  RoleAll,
  RoleBanned,
  RoleManager,
  RoleUser,
} from "../../../types/User.type";

const ROLE_ALL: Role<RoleAll> = {
  id: 1,
  type: "ALL",
  kr: "전체",
};

const ROLE_ADMIN: Role<RoleAdmin> = {
  id: 2,
  type: "ADMIN",
  kr: "관리자",
};

const ROLE_MANAGER: Role<RoleManager> = {
  id: 3,
  type: "MANAGER",
  kr: "매니저",
};

const ROLE_USER: Role<RoleUser> = {
  id: 4,
  type: "USER",
  kr: "유저",
};

const ROLE_BANND: Role<RoleBanned> = {
  id: 5,
  type: "BANNED",
  kr: "정지",
};

const roles = {
  ALL: ROLE_ALL,
  ADMIN: ROLE_ADMIN,
  MANAGER: ROLE_MANAGER,
  USER: ROLE_USER,
  BANNED: ROLE_BANND,
};

export default roles;
