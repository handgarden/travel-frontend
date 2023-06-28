import { PaymentMethodType } from "./Payment.type";

export type RoomType = {
  id: number;
  accommodationId: number;
  accommodationName: string;
  name: string;
  price: number;
  inTime: string;
};

export type CreateRoomForm = {
  name: string;
  price: number;
  stock: number;
  inTime: string;
};

export type RoomDateQuery = {
  start: string;
  end: string;
};

export type RoomReserveType = {
  room: RoomType;
  reservationAvailability: boolean;
};

export type ReserveRoomForm = {
  paymentMethod: PaymentMethodType;
  startDate: string;
  endDate: string;
};
