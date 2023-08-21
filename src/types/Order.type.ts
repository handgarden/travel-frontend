type ORDER_STATUS_CREATED = "CREATED";
type ORDER_STATUS_CANCELLED = "CANCELLED";
type ORDER_STATUS_CONFIRMED = "CONFIRMED";

export type OrderStatusType =
  | ORDER_STATUS_CREATED
  | ORDER_STATUS_CANCELLED
  | ORDER_STATUS_CONFIRMED;

export type RoomOrderType = {
  id: number;
  accommodationId: number;
  accommodationName: string;
  roomId: number;
  roomName: string;
  roomPrice: number;
  inTime: string;
  totalPrice: number;
  startDate: string;
  endDate: string;
  consumerNickname: string;
  status: OrderStatusType;
  createdAt: string;
  updatedAt: string;
};
