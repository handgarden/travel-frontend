import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Tag,
  Typography,
} from "antd";
import {
  CreateCreditCardForm,
  CreditCardType,
  DepositToTravelPayForm,
  PaymentMethodType,
  TravelPayType,
} from "../../types/Payment.type";
import useModalState from "../hook/useModalState";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "antd/es/form/Form";
import { validationMessages } from "../../lib/validation/validation.message";
import useRepository from "../hook/useRepository";
import useGlobalError from "../hook/useGlobalError";
import usePaymentMethod from "../hook/usePaymentMethod";
import React from "react";
import { ErrorResponse } from "../../types/repository/basic.type";

type DepositModalProps = {
  deposit: (amount: number) => void;
};

const DepositModal: React.FC<DepositModalProps> = ({ deposit }) => {
  const { isModalOpen, handleCancel, showModal } = useModalState();

  const [form] = useForm<DepositToTravelPayForm>();

  const [loading, setLoading] = useState<boolean>(false);

  const { PaymentRepository } = useRepository();

  const { setGlobalError, GlobalErrorItem } = useGlobalError();

  form.submit = async () => {
    try {
      const data = await form.validateFields();
      if (data.depositAmount % 1000 !== 0) {
        setGlobalError("1000원 단위만 충전가능합니다.");
        return;
      }
      setGlobalError("");
      if (
        !window.confirm(`정말로 ${data.depositAmount}원을 충전하시겠습니까?`)
      ) {
        return;
      }
      setLoading(true);
      const response = await PaymentRepository.depositTravelPay(
        data,
        undefined,
        undefined
      );
      if (response.success) {
        deposit(data.depositAmount);
        window.alert("충전에 성공했습니다.");
        handleCancel();
        return;
      }
      if (response.error) {
        if (response.error.message) {
          setGlobalError(response.error.message);
          return;
        }
        if (
          response.error.bindingErrors &&
          response.error.bindingErrors.length > 0
        ) {
          const bindingErr = response.error.bindingErrors[0];
          setGlobalError(bindingErr.defaultMessage);
          return;
        }
        window.alert("충전에 실패했습니다.");
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => {
    handleCancel();
    form.resetFields();
  };

  return (
    <>
      <Button type="primary" ghost onClick={showModal}>
        충전
      </Button>
      <Modal
        open={isModalOpen}
        onCancel={cancel}
        title="트래블 페이 충전"
        okButtonProps={{ loading: loading }}
        okText="충전"
        onOk={form.submit}
        cancelText="취소"
        cancelButtonProps={{ loading: loading }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ margin: "1.5rem 0" }}
          validateMessages={validationMessages}
        >
          <Form.Item
            label="충전 금액"
            rules={[
              { required: true, type: "number", min: 1000, max: 10000000 },
            ]}
            name="depositAmount"
          >
            <InputNumber
              style={{ width: "50%" }}
              step={1000}
              min={0}
              max={10000000}
            />
          </Form.Item>
        </Form>
        {GlobalErrorItem}
      </Modal>
    </>
  );
};

type TravelPayProps = {
  data: TravelPayType;
  deposit: (amount: number) => void;
};

const TravelPay: React.FC<TravelPayProps> = ({ data, deposit }) => {
  const extraBtn = <DepositModal deposit={deposit} />;

  const title = (
    <Typography.Paragraph style={{ margin: 0 }}>
      <Tag color="blue">PAY</Tag>
      <Typography.Text>트래블 페이</Typography.Text>
    </Typography.Paragraph>
  );

  return (
    <Card
      title={title}
      extra={extraBtn}
      style={{
        maxWidth: "500px",
        margin: "auto",
      }}
    >
      <Typography.Paragraph style={{ margin: 0 }}>
        잔고: {data.balance}
      </Typography.Paragraph>
    </Card>
  );
};

type CreditCardProps = {
  data: CreditCardType;
  deleteCard: (id: number) => void;
  hideDelete?: boolean;
};

const cardNumberFormatter = (cardNumber: string) => {
  let formattedNumber = "";

  for (let i = 0; i < 4; i++) {
    const offset = i * 4;
    const s = cardNumber.slice(offset, offset + 4);
    formattedNumber += s;
    if (i !== 3) {
      formattedNumber += " - ";
    }
  }
  return formattedNumber;
};

const CreditCard: React.FC<CreditCardProps> = ({
  data,
  deleteCard,
  hideDelete = false,
}) => {
  const { PaymentRepository } = useRepository();

  const [loading, setLoading] = useState<boolean>(false);
  const submitDelete = async () => {
    if (!window.confirm("카드를 정말로 제거하시겠습니까?")) {
      return;
    }
    setLoading(true);
    const response = await PaymentRepository.deleteCreditCard(data.id);
    setLoading(false);
    if (response.success) {
      window.alert("카드를 성공적으로 제거했습니다.");
      deleteCard(data.id);
      return;
    }
    const err = response.error as ErrorResponse;

    if (err.status === 400 && err.message && err.message.length > 0) {
      window.alert(err.message);
      return;
    }

    window.alert("카드를 제거하는데 실패했습니다.");
  };

  const deleteBtn = (
    <Button type="primary" ghost onClick={submitDelete} loading={loading}>
      제거
    </Button>
  );

  const title = (
    <Typography.Paragraph style={{ margin: 0 }}>
      <Tag color="magenta">CARD</Tag>
      <Typography.Text>신용카드</Typography.Text>
    </Typography.Paragraph>
  );

  return (
    <Card
      title={title}
      extra={hideDelete ? null : deleteBtn}
      style={{
        maxWidth: "500px",
        margin: "auto",
      }}
    >
      <Typography.Paragraph>카드 이름: {data.cardName}</Typography.Paragraph>
      <Typography.Paragraph>소유자: {data.ownerName}</Typography.Paragraph>
      <Typography.Paragraph>
        카드 번호: {cardNumberFormatter(data.cardNumber)}
      </Typography.Paragraph>
    </Card>
  );
};

type CreateCreditCardInstance = {
  cardOwner: string;
  cardName: string;
  cardNumber1: number;
  cardNumber2: number;
  cardNumber3: number;
  cardNumber4: number;
};

type AddCreditCardProps = {
  addCard: (newCard: CreditCardType) => void;
};

const AddCreditCard: React.FC<AddCreditCardProps> = ({ addCard }) => {
  const { isModalOpen, handleCancel, showModal } = useModalState();

  const [form] = useForm<CreateCreditCardInstance>();

  const { PaymentRepository } = useRepository();

  const [loading, setLoading] = useState<boolean>(false);

  const { setGlobalError, GlobalErrorItem } = useGlobalError();

  const cancel = () => {
    form.resetFields();
    handleCancel();
  };

  form.submit = async () => {
    try {
      const data = await form.validateFields();
      const cardNumber =
        data.cardNumber1.toString() +
        data.cardNumber2.toString() +
        data.cardNumber3.toString() +
        data.cardNumber4.toString();
      const requestData: CreateCreditCardForm = {
        cardOwner: data.cardOwner,
        cardName: data.cardName,
        cardNumber: cardNumber,
      };
      setLoading(true);
      const response = await PaymentRepository.createCreditCard(
        requestData,
        undefined,
        undefined
      );
      if (response.success) {
        const newCard: CreditCardType = {
          id: response.response as number,
          cardName: requestData.cardName,
          ownerName: requestData.cardOwner,
          cardNumber: requestData.cardNumber.slice(0, 12) + "xxxx",
        };
        addCard(newCard);
        window.alert("카드를 성공적으로 추가헀습니다.");
        handleCancel();
        form.resetFields();
        return;
      }

      if (response.error) {
        if (response.error.message) {
          setGlobalError(response.error.message);
          return;
        }
        const bindingErr = response.error.bindingErrors;
        if (bindingErr && bindingErr.length > 0) {
          setGlobalError(bindingErr[0].defaultMessage);
          return;
        }
      }
      window.alert("카드를 추가하는데 실패했습니다.");
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const cardRules = [
    { required: true },
    {
      pattern: /^\d{4}$/,
      message: "4자리 숫자만 입력해주세요.",
    },
  ];

  return (
    <>
      <Button type="primary" ghost onClick={showModal}>
        추가
      </Button>
      <Modal
        title="신용카드 추가"
        open={isModalOpen}
        onCancel={cancel}
        onOk={form.submit}
        okButtonProps={{ loading }}
        cancelButtonProps={{ loading }}
      >
        <Typography.Paragraph type="danger">
          테스트 페이지입니다. 실제 카드 정보를 입력하지마세요.
        </Typography.Paragraph>
        <Form
          style={{ margin: "1.5rem 0" }}
          form={form}
          layout="vertical"
          validateMessages={validationMessages}
        >
          <Form.Item
            label="이름(별칭)"
            name="cardName"
            rules={[{ required: true }, { min: 4, max: 16 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="소유자"
            name="cardOwner"
            rules={[{ required: true }, { min: 1, max: 16 }]}
          >
            <Input />
          </Form.Item>
          <label style={{ paddingBottom: "8px", display: "block" }}>
            <Typography.Text
              type="danger"
              style={{ fontSize: "14px", marginRight: "4px" }}
            >
              *
            </Typography.Text>
            번호(16자리)
          </label>
          <Row>
            <Col span={6}>
              <Form.Item name="cardNumber1" rules={cardRules}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="cardNumber2" rules={cardRules}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="cardNumber3" rules={cardRules}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="cardNumber4" rules={cardRules}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {GlobalErrorItem}
      </Modal>
    </>
  );
};

const Wallet: React.FC = () => {
  const { paymentMethod, setPaymentMethod, deposit } = usePaymentMethod();

  const addCard = useCallback(
    (newCard: CreditCardType) => {
      setPaymentMethod((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          creditCards: [...prev.creditCards, newCard],
        };
      });
    },
    [setPaymentMethod]
  );

  const deleteCard = useCallback(
    (cardId: number) => {
      setPaymentMethod((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          creditCards: prev.creditCards.filter((c) => c.id !== cardId),
        };
      });
    },
    [setPaymentMethod]
  );

  if (!paymentMethod) {
    return null;
  }

  return (
    <div
      style={{
        // maxWidth: "500px",
        margin: "auto",
      }}
    >
      <Card title="페이">
        <PaymentMethod.TravelPay
          data={paymentMethod.travelPay}
          deposit={deposit}
        />
      </Card>
      <Divider />
      <Card
        title="카드"
        extra={<PaymentMethod.AddCreditCard addCard={addCard} />}
      >
        {paymentMethod.creditCards.map((c, index) => (
          <React.Fragment key={c.id}>
            <PaymentMethod.CreditCard data={c} deleteCard={deleteCard} />
            {index < paymentMethod.creditCards.length - 1 ? <Divider /> : null}
          </React.Fragment>
        ))}
      </Card>
    </div>
  );
};

type SelectiveWalletProps = {
  selectedMethod: PaymentMethodType | undefined;
  setSelectedMethod: (method: PaymentMethodType) => void;
};

const SelectiveWallet: React.FC<SelectiveWalletProps> = ({
  selectedMethod,
  setSelectedMethod,
}) => {
  const { paymentMethod, setPaymentMethod, deposit } = usePaymentMethod();

  const addCard = useCallback(
    (newCard: CreditCardType) => {
      setPaymentMethod((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          creditCards: [...prev.creditCards, newCard],
        };
      });
    },
    [setPaymentMethod]
  );

  const deleteCard = useCallback(
    (cardId: number) => {
      setPaymentMethod((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          creditCards: prev.creditCards.filter((c) => c.id !== cardId),
        };
      });
    },
    [setPaymentMethod]
  );

  useEffect(() => {
    if (paymentMethod) {
      setSelectedMethod({
        paymentType: "TRAVEL_PAY",
        paymentMethodId: paymentMethod?.travelPay.id,
      });
    }
  }, [paymentMethod, setSelectedMethod]);

  const travelPayOption = useMemo(() => {
    if (!paymentMethod) {
      return undefined;
    }
    return {
      paymentType: "TRAVEL_PAY",
      paymentMethodId: paymentMethod.travelPay.id,
    };
  }, [paymentMethod]);

  const creditCardOptions = useMemo(() => {
    let options: { [id: string]: PaymentMethodType } = {};
    if (!paymentMethod) {
      return options;
    }

    paymentMethod.creditCards.forEach((c) => {
      const option: PaymentMethodType = {
        paymentType: "CREDIT_CARD",
        paymentMethodId: c.id,
      };

      options = {
        ...options,
        [c.id]: option,
      };
    });

    return options;
  }, [paymentMethod]);

  if (!paymentMethod) {
    return null;
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "auto",
      }}
    >
      <Radio.Group
        style={{ width: "100%" }}
        // optionType="button"
        // size="small"
        onChange={(e) => {
          if (e.target.value) {
            setSelectedMethod(e.target.value);
          }
        }}
        value={selectedMethod}
      >
        <Card title="페이">
          <Row justify="space-between" align="middle">
            <Col span={3}>
              <Radio value={travelPayOption} />
            </Col>
            <Col span={21}>
              <PaymentMethod.TravelPay
                data={paymentMethod.travelPay}
                deposit={deposit}
              />
            </Col>
          </Row>
        </Card>
        <Divider />
        <Card
          title="카드"
          extra={<PaymentMethod.AddCreditCard addCard={addCard} />}
        >
          {paymentMethod.creditCards.map((c, index) => {
            const option = creditCardOptions[c.id];
            return (
              <React.Fragment key={c.id}>
                <Row justify="space-between" align="middle">
                  <Col span={3}>
                    <Radio value={option} />
                  </Col>
                  <Col span={21}>
                    <PaymentMethod.CreditCard
                      data={c}
                      deleteCard={deleteCard}
                      hideDelete
                    />
                  </Col>
                </Row>
                {index < paymentMethod.creditCards.length - 1 ? (
                  <Divider />
                ) : null}
              </React.Fragment>
            );
          })}
        </Card>
      </Radio.Group>
    </div>
  );
};

const PaymentMethod = {
  TravelPay,
  CreditCard,
  AddCreditCard,
  Wallet,
  SelectiveWallet,
};

export default PaymentMethod;
