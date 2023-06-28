import { useCallback, useEffect, useState } from "react";
import useRepository from "./useRepository";
import { PaymentMethodInFoType } from "../../types/Payment.type";

const usePaymentMethod = () => {
  const { PaymentRepository } = useRepository();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodInFoType>();

  const getData = useCallback(async () => {
    const response = await PaymentRepository.getPaymentMethod(
      undefined,
      undefined
    );
    if (response.success) {
      setPaymentMethod(response.response as PaymentMethodInFoType);
      return;
    }
    window.alert("결제수단을 가져오는데 실패했습니다.");
  }, [PaymentRepository]);

  useEffect(() => {
    getData();
  }, [getData]);

  const deposit = useCallback(
    (amount: number) => {
      setPaymentMethod((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          travelPay: {
            ...prev.travelPay,
            balance: prev.travelPay.balance + amount,
          },
        };
      });
    },
    [setPaymentMethod]
  );

  return { paymentMethod, setPaymentMethod, deposit };
};

export default usePaymentMethod;
