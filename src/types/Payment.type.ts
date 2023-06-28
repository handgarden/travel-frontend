export type TravelPayType = {
  id: number;
  balance: number;
};

export type CreditCardType = {
  id: number;
  cardName: string;
  ownerName: string;
  cardNumber: string;
};

export type PaymentMethodInFoType = {
  travelPay: TravelPayType;
  creditCards: CreditCardType[];
};

export type DepositToTravelPayForm = {
  depositAmount: number;
};

export type CreateCreditCardForm = {
  cardOwner: string;
  cardNumber: string;
  cardName: string;
};

type PAYMENT_TYPE_CREDIT_CARD = "CREDIT_CARD";
type PAYMENT_TYPE_TRAVEL_PAY = "TRAVEL_PAY";

export type PAYMENT_TYPE = PAYMENT_TYPE_CREDIT_CARD | PAYMENT_TYPE_TRAVEL_PAY;

export type PaymentMethodType = {
  paymentType: PAYMENT_TYPE;
  paymentMethodId: number;
};
