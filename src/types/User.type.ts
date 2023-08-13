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
