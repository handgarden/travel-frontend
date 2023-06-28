import { useCallback, useEffect, useMemo, useState } from "react";
import useRepository from "../hook/useRepository";
import {
  Button,
  Card,
  Pagination,
  Space,
  Tag,
  TagProps,
  Typography,
} from "antd";
import {
  ErrorResponse,
  PaginationQuery,
  PaginationResponse,
} from "../../types/repository/basic.type";
import { OrderStatusType, RoomOrderType } from "../../types/Order.type";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { LocalDateFormat, LocalTimeFormat } from "../../types/Date.type";

type StatusProps = {
  status: OrderStatusType;
};

const StatusTag: React.FC<StatusProps> = ({ status }) => {
  const message = useMemo(() => {
    switch (status) {
      case "CREATED":
        return "결제 완료";
      case "CONFIRMED":
        return "예약 확정";
      default:
        return "결제 취소";
    }
  }, [status]);

  const color: TagProps["color"] = useMemo(() => {
    switch (status) {
      case "CREATED":
        return "blue";
      case "CONFIRMED":
        return "green";
      default:
        return "magenta";
    }
  }, [status]);

  return <Tag color={color}>{message}</Tag>;
};

type ElemProps = {
  data: RoomOrderType;
  confirm: (dataId: number) => void;
  cancel: (dataId: number) => void;
  showConsumer?: boolean;
};

const Elem: React.FC<ElemProps> = ({
  data,
  confirm,
  cancel,
  showConsumer = false,
}) => {
  const title = (
    <Space>
      <Typography.Text>{`주문 번호: ${data.id}`}</Typography.Text>
      <StatusTag status={data.status} />
    </Space>
  );

  const { AccommodationRepository } = useRepository();

  const confirmOrder = useCallback(async () => {
    if (!window.confirm("정말로 예약을 확정하시겠습니까?")) {
      return;
    }
    const response = await AccommodationRepository.confirmOrder(
      undefined,
      data.id,
      undefined
    );
    if (response.success) {
      window.alert("예약을 성공적으로 확정했습니다.");
      confirm(data.id);
      return;
    }

    const err = response.error as ErrorResponse;
    if (err.message && err.message.length > 0) {
      window.alert(err.message);
      return;
    }
    window.alert("예약을 확정하는데 오류가 발생했습니다.");
  }, [AccommodationRepository, confirm, data.id]);

  const cancelOrder = useCallback(async () => {
    const startDay = dayjs(data.startDate, LocalDateFormat);
    const inTime = dayjs(data.inTime, LocalTimeFormat);
    const limitInTime = startDay
      .set("hour", inTime.hour())
      .set("minute", inTime.minute());
    const now = dayjs();
    if (now.diff(dayjs(data.createdAt), "minute") > 10) {
      if (now.diff(limitInTime, "minute") > 30) {
        window.alert("취소 가능한 시간이 지나 취소할 수 없습니다.");
      }
    }
    if (!window.confirm("정말로 예약을 취소하시겠습니까?")) {
      return;
    }

    const response = await AccommodationRepository.cancelOrder(
      undefined,
      data.id,
      undefined
    );
    if (response.success) {
      window.alert("예약을 성공적으로 취소했습니다.");
      cancel(data.id);
      return;
    }

    const err = response.error as ErrorResponse;
    if (err.message && err.message.length > 0) {
      window.alert(err.message);
      return;
    }
    window.alert("예약을 취소하는데 오류가 발생했습니다.");
  }, [
    AccommodationRepository,
    cancel,
    data.createdAt,
    data.id,
    data.inTime,
    data.startDate,
  ]);

  const extra = useMemo(() => {
    return (
      <Space>
        <Button
          onClick={confirmOrder}
          type="primary"
          ghost
          disabled={data.status !== "CREATED"}
          size="small"
        >
          예약 확정
        </Button>
        <Button
          danger
          ghost
          onClick={cancelOrder}
          disabled={data.status !== "CREATED"}
          size="small"
        >
          예약 취소
        </Button>
      </Space>
    );
  }, [cancelOrder, confirmOrder, data.status]);

  return (
    <>
      <Card title={title} extra={extra}>
        <Typography.Paragraph>{`주문 일자: ${dayjs(data.createdAt).format(
          "YYYY-MM-DD hh:mm a"
        )}`}</Typography.Paragraph>
        {showConsumer ? (
          <Typography.Paragraph>{`예약자: ${data.member.nickname}`}</Typography.Paragraph>
        ) : null}
        <Typography.Paragraph>
          <Typography.Text>숙소: </Typography.Text>
          <Link to={`/destination/accommodation/${data.accommodationId}`}>
            {data.accommodationName}
          </Link>
        </Typography.Paragraph>
        <Typography.Paragraph>{`방: ${data.roomName}`}</Typography.Paragraph>
        <Typography.Paragraph>{`가격: ${data.roomPrice}`}</Typography.Paragraph>
        <Typography.Paragraph>{`입실 시간: ${dayjs(
          data.inTime,
          LocalTimeFormat
        ).format("hh:mm a")}`}</Typography.Paragraph>
        <Typography.Paragraph>{`예약 일정: ${data.startDate} ~ ${data.endDate}`}</Typography.Paragraph>
        <Typography.Paragraph>{`결제 금액: ${data.totalPrice}`}</Typography.Paragraph>
      </Card>
    </>
  );
};

const List: React.FC = () => {
  const { AccommodationRepository } = useRepository();

  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    size: 10,
  });

  const [orders, setOrders] = useState<RoomOrderType[]>([]);

  const [total, setTotal] = useState<number>(0);

  const getData = useCallback(
    async (paginationQuery: PaginationQuery) => {
      const response = await AccommodationRepository.getOrders(
        undefined,
        paginationQuery
      );
      if (response.success) {
        const data = response.response as PaginationResponse<RoomOrderType>;
        setOrders(data.data);
        setTotal(data.total);
        return;
      }

      window.alert("결제내역을 가져오는데 실패했습니다.");
    },
    [AccommodationRepository]
  );

  useEffect(() => {
    getData(pagination);
  }, [getData, pagination]);

  const confirmOrder = useCallback((dataId: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== dataId) {
          return o;
        }

        return {
          ...o,
          status: "CONFIRMED",
        };
      })
    );
  }, []);

  const cancelOrder = useCallback((dataId: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== dataId) {
          return o;
        }

        return {
          ...o,
          status: "CANCELLED",
        };
      })
    );
  }, []);

  return (
    <>
      <Space
        direction="vertical"
        size="large"
        style={{ display: "flex", paddingBottom: "1rem" }}
      >
        {orders.map((o) => (
          <Elem
            data={o}
            key={o.id}
            confirm={confirmOrder}
            cancel={cancelOrder}
          />
        ))}
      </Space>
      <Pagination
        pageSize={pagination.size}
        current={pagination.page}
        onChange={(page, pageSize) => {
          setPagination({ page, size: pageSize });
        }}
        total={total}
        showSizeChanger={total > 0}
      />
    </>
  );
};

type SalesListProps = {
  roomId: number;
};

const SalesList: React.FC<SalesListProps> = ({ roomId }) => {
  const { AccommodationRepository } = useRepository();

  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    size: 10,
  });

  const [orders, setOrders] = useState<RoomOrderType[]>([]);

  const [total, setTotal] = useState<number>(0);

  const getData = useCallback(
    async (paginationQuery: PaginationQuery) => {
      const response = await AccommodationRepository.getOrdersByRoom(
        roomId,
        paginationQuery
      );
      if (response.success) {
        const data = response.response as PaginationResponse<RoomOrderType>;
        setOrders(data.data);
        setTotal(data.total);
        return;
      }

      window.alert("판매내역을 가져오는데 실패했습니다.");
    },
    [AccommodationRepository, roomId]
  );

  useEffect(() => {
    getData(pagination);
  }, [getData, pagination]);

  const confirmOrder = useCallback((dataId: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== dataId) {
          return o;
        }

        return {
          ...o,
          status: "CONFIRMED",
        };
      })
    );
  }, []);

  const cancelOrder = useCallback((dataId: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== dataId) {
          return o;
        }

        return {
          ...o,
          status: "CANCELLED",
        };
      })
    );
  }, []);

  return (
    <>
      <Space
        direction="vertical"
        size="large"
        style={{ display: "flex", paddingBottom: "1rem" }}
      >
        {orders.map((o) => (
          <Elem
            data={o}
            key={o.id}
            confirm={confirmOrder}
            cancel={cancelOrder}
            showConsumer
          />
        ))}
      </Space>
      <Pagination
        pageSize={pagination.size}
        current={pagination.page}
        onChange={(page, pageSize) => {
          setPagination({ page, size: pageSize });
        }}
        total={total}
        showSizeChanger={total > 0}
      />
    </>
  );
};

const Order = {
  List,
  SalesList,
};

export default Order;
