export type RoleAll = "ALL";
export type RoleAdmin = "ADMIN";
export type RoleManager = "MANAGER";
export type RoleUser = "USER";
export type RoleBanned = "BANNED";
export type ROLE_TYPE =
  | RoleAll
  | RoleAdmin
  | RoleManager
  | RoleUser
  | RoleBanned;

export type Role<T extends ROLE_TYPE> = {
  id: number;
  type: T;
  kr: "전체" | "관리자" | "매니저" | "유저" | "정지";
};

/**
 * destination에서 작성자 정보에 사용
 * 완전 기본 사용자 정보
 */

export type MemberBasicProfile = {
  nickname: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * admin 혹은 작성자 상세 정보에 접근할 때 사용
 * 좀 더 자세한 유저 정보
 */

export type MemberBanInfo = {
  id: number;
  creator: MemberBasicProfile;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type MemberProfileResponse = {
  account: string;
  role: ROLE_TYPE;
} & MemberBasicProfile;

export type MemberProfile = {
  account: string;
  role: Role<ROLE_TYPE>;
} & MemberBasicProfile;

export type MemberDetailProfileResponse = {
  banInfoList: MemberBanInfo[];
} & MemberProfileResponse;

export type MemberDetailProfile = {
  banInfoList: MemberBanInfo[];
} & MemberProfile;
/**
 * 회원 정보 관리
 */

export type UpdateNicknameForm = {
  nickname: string;
  newNickname: string;
};

export type UpdatePasswordForm = {
  prevRawPassword: string;
  newRawPassword: string;
};
