import {
  Button,
  Card,
  Collapse,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Space,
  Table,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import {
  CreateRoomForm,
  ReserveRoomForm,
  RoomDateQuery,
  RoomReserveType,
  RoomType,
} from "../../types/Room.type";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useRepository from "../hook/useRepository";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "antd/es/form/Form";
import useGlobalError from "../hook/useGlobalError";
import useRedirectPath from "../hook/useRedirectPath";
import { validationMessages } from "../../lib/validation/validation.message";
import dayjs, { Dayjs } from "dayjs";
import { ColumnsType } from "antd/es/table";
import { destinationPath, userPath } from "../router/path";
import { PaymentMethodType } from "../../types/Payment.type";
import PaymentMethod from "./PaymentMethod";
import {
  ErrorResponse,
  PaginationQuery,
  PaginationResponse,
} from "../../types/repository/basic.type";
import locale from "antd/es/date-picker/locale/ko_KR";
import { LocalDateFormat as LOCAL_DATE_FORMAT } from "../../types/Date.type";
import useQueryString from "../hook/useQueryString";

const timeParser = (time: string) => {
  const h = time.slice(0, 2);
  const m = time.slice(3, 5);
  return dayjs().hour(parseInt(h)).minute(parseInt(m)).format("h:mm a");
};

type ElemProps = {
  data: RoomReserveType[];
  start: Dayjs;
  end: Dayjs;
};

type RoomElemType = {
  key: number;
  id: number;
  name: string;
  price: number;
  reservationAvailability: React.ReactNode;
  inTime: string;
};

const RoomTable: React.FC<ElemProps> = ({ data, start, end }) => {
  const columns: ColumnsType<RoomElemType> = [
    {
      title: "방 이름",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "가격",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "입실 시간",
      dataIndex: "inTime",
      key: "inTime",
    },
    {
      title: "예약 가능 여부",
      dataIndex: "reservationAvailability",
      key: "reservationAvailability",
    },
    {
      title: "예약",
      dataIndex: "reserve",
      key: "reserve",
    },
  ];
  const [dataSource, setDataSource] = useState<RoomElemType[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    setDataSource(
      data.map((d) => {
        const room = d.room;
        const onClick = () => {
          navigate(
            encodeURI(
              `${destinationPath.RESERVE_ROOM.slice(0, -4)}/${
                room.id
              }?start=${start.format(LOCAL_DATE_FORMAT)}&end=${end.format(
                LOCAL_DATE_FORMAT
              )}`
            )
          );
        };
        return {
          ...room,
          inTime: timeParser(room.inTime),
          key: room.id,
          reservationAvailability: d.reservationAvailability ? (
            <Tag color="green">가능</Tag>
          ) : (
            <Tag color="magenta">불가능</Tag>
          ),
          reserve: (
            <Button
              onClick={onClick}
              type="primary"
              ghost
              disabled={!d.reservationAvailability}
            >
              예약
            </Button>
          ),
        };
      })
    );
  }, [data, end, navigate, start]);

  return (
    <>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        style={{ overflow: "auto" }}
      />
    </>
  );
};

type ListProps = {
  dataId: number;
  isOwner: boolean;
};
const List: React.FC<ListProps> = ({ dataId, isOwner }) => {
  const [rooms, setRooms] = useState<RoomReserveType[]>([]);

  const { AccommodationRepository } = useRepository();

  const [loading, setLoading] = useState<boolean>(false);

  const getRooms = useCallback(
    async (dateQuery: RoomDateQuery) => {
      setLoading(true);
      const response = await AccommodationRepository.getRoomsForReserve(
        dataId.toString(),
        dateQuery
      );
      if (!response.success) {
        window.alert("여행지 데이터를 가져오는데 실패했습니다.");
        return;
      }
      setRooms(response.response as RoomReserveType[]);
      setLoading(false);
    },
    [AccommodationRepository, dataId]
  );

  useEffect(() => {
    const query = {
      start: dayjs().format(LOCAL_DATE_FORMAT),
      end: dayjs().add(1, "day").format(LOCAL_DATE_FORMAT),
    };
    getRooms(query);
  }, [getRooms]);

  const [startDate, setStartDate] = useState<Dayjs>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs>(dayjs().add(1, "day"));
  const { globalError, setGlobalError, GlobalErrorItem } = useGlobalError();

  const submit = () => {
    const query = {
      start: startDate.format(LOCAL_DATE_FORMAT),
      end: endDate.format(LOCAL_DATE_FORMAT),
    };
    getRooms(query);
  };

  return (
    <>
      <Add dataId={dataId} isOwner={isOwner} />
      {isOwner ? <Divider /> : null}
      <Typography.Title level={5}>숙소 예약</Typography.Title>
      <Space style={{ marginBottom: "1rem" }}>
        <DatePicker.RangePicker
          locale={locale}
          value={[startDate, endDate]}
          onChange={(v) => {
            if (!v) {
              return;
            }
            const start = v[0] as Dayjs;
            const end = v[1] as Dayjs;
            if (start.isSame(end)) {
              setGlobalError("시작 날과 끝 날은 하루 이상 차이가 나야합니다.");
            } else {
              setGlobalError("");
            }
            setStartDate(start);
            setEndDate(end);
          }}
          disabledDate={(c) => {
            return c.isBefore(dayjs().add(-1, "day"));
          }}
        />
        <Button
          type="primary"
          ghost
          disabled={globalError.length > 0}
          loading={loading}
          onClick={submit}
        >
          검색
        </Button>
      </Space>
      {GlobalErrorItem}
      <RoomTable data={rooms} start={startDate} end={endDate} />
      <Divider />
    </>
  );
};

type AddProps = {
  dataId: number;
  isOwner: boolean;
};

type CreateRoomFormInstance = {
  name: string;
  price: number;
  stock: number;
  inTime: Dayjs;
};

const Add: React.FC<AddProps> = ({ dataId, isOwner }) => {
  const [form] = useForm<CreateRoomFormInstance>();

  const Panel = Collapse.Panel;

  const [open, setOpen] = useState<string[]>([]);

  const { setGlobalError, GlobalErrorItem } = useGlobalError();

  const { AccommodationRepository } = useRepository();

  const navigate = useNavigate();

  const redirectPath = useRedirectPath();

  const [loading, setLoading] = useState<boolean>(false);
  const submit = async () => {
    try {
      const data = await form.validateFields();
      setGlobalError("");
      const requestData: CreateRoomForm = {
        ...data,
        inTime: data.inTime.format("HH:mm"),
      };
      setLoading(true);
      const response = await AccommodationRepository.createRoom(
        requestData,
        dataId,
        undefined
      );
      setLoading(false);
      if (!response.success) {
        if (response.error) {
          if (response.error.status === 401) {
            window.alert("로그인이 필요합니다.");
            navigate("/login" + redirectPath);
            return;
          }
          if (response.error.status === 409) {
            setGlobalError("중복된 방이 존재합니다.");
            return;
          }
          const bindingErr = response.error.bindingErrors;
          if (bindingErr.length > 0) {
            setGlobalError(bindingErr[0].defaultMessage);
            return;
          }
        }
        window.alert(
          "후기를 추가하는데 오류가 발생했습니다. 다시 시도해주세요."
        );
        return;
      }
      window.alert(
        "방을 추가했습니다. 예약 리스트를 재조회하면 추가된 방을 확인할 수 있습니다."
      );
      setGlobalError("");
      form.resetFields();
      setOpen([]);
    } catch (e) {}
  };

  if (!isOwner) {
    return null;
  }

  return (
    <Collapse
      bordered={false}
      activeKey={open}
      onChange={(v) => {
        setOpen(v as string[]);
      }}
    >
      <Panel header="방 추가" key="1">
        <Form
          form={form}
          layout="vertical"
          validateMessages={validationMessages}
        >
          <Form.Item
            name="name"
            label="방 이름"
            rules={[{ required: true, type: "string", min: 4, max: 16 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="가격"
            rules={[
              { required: true, type: "number", min: 5000, max: 2147483647 },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="stock"
            label="재고"
            rules={[{ required: true, type: "number", min: 1, max: 1000 }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="inTime"
            label="입실 시간"
            rules={[{ required: true }]}
          >
            <TimePicker format={"h:mm a"} />
          </Form.Item>
          {GlobalErrorItem}
        </Form>
        <Space>
          <Button onClick={submit} loading={loading}>
            추가
          </Button>
          <Button
            onClick={() => {
              setOpen([]);
            }}
          >
            취소
          </Button>
        </Space>
      </Panel>
    </Collapse>
  );
};

type ReserveProps = {
  roomId: number;
};

const Reserve: React.FC<ReserveProps> = ({ roomId }) => {
  const [room, setRoom] = useState<RoomType>();

  const query = useQueryString();

  const dateInfo: { start: Dayjs; end: Dayjs } = useMemo(() => {
    const start = (query.start as string) || "";
    const end = (query.end as string) || "";
    return {
      start: dayjs(start, "YYYY-MM-DD"),
      end: dayjs(end, "YYYY-MM-DD"),
    };
  }, [query.end, query.start]);

  const { AccommodationRepository } = useRepository();

  const getData = useCallback(async () => {
    const response = await AccommodationRepository.getRoom(roomId);
    if (response.success) {
      const data = response.response as RoomType;
      setRoom(data);
      return;
    }
    window.alert("방 정보를 가져오는데 오류가 발생했습니다.");
  }, [AccommodationRepository, roomId]);

  useEffect(() => {
    getData();
  }, [getData]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>();

  const setSelectedMethod = useCallback((v: PaymentMethodType) => {
    setPaymentMethod(v);
  }, []);

  const navigate = useNavigate();

  const reserveRoom = useCallback(async () => {
    if (!dateInfo.start.isValid() || !dateInfo.end.isValid()) {
      window.alert(
        "예약 일정에 오류가 있습니다. 예약을 처음부터 다시 시도해주세요."
      );
      navigate(-1);
      return;
    }
    if (!paymentMethod) {
      window.alert("결제 수단을 선택해주세요.");
      return;
    }
    if (!window.confirm("결제를 진행하시겠습니까?")) {
      return;
    }
    const reserveRoomForm: ReserveRoomForm = {
      paymentMethod,
      startDate: dateInfo.start.format("YYYY-MM-DD"),
      endDate: dateInfo.end.format("YYYY-MM-DD"),
    };
    const response = await AccommodationRepository.reserveRoom(
      reserveRoomForm,
      roomId,
      undefined
    );
    if (response.success) {
      navigate(userPath.ORDER, { replace: true });
      return;
    }
    const err = response.error as ErrorResponse;
    if (err.message && err.message.length > 0) {
      window.alert(err.message);
      return;
    }
    window.alert("결제에 실패했습니다.");
  }, [
    AccommodationRepository,
    dateInfo.end,
    dateInfo.start,
    navigate,
    paymentMethod,
    roomId,
  ]);

  if (!room) {
    return null;
  }

  return (
    <>
      <Typography.Title level={5} style={{ marginBottom: "1.5rem" }}>
        방 예약
      </Typography.Title>
      <Divider />
      <Card title="방 정보">
        <Typography.Paragraph>
          <Typography.Text>숙소 : </Typography.Text>
          <Link
            to={`${destinationPath.ACCOMMODATION}/${room.accommodationId}`}
            target="_blank"
          >
            {room.accommodationName}
          </Link>
        </Typography.Paragraph>
        <Typography.Paragraph>{`이름: ${room.name}`}</Typography.Paragraph>
        <Typography.Paragraph>{`가격: ${room.price}`}</Typography.Paragraph>
        <Typography.Paragraph>{`입실 시간: ${timeParser(
          room.inTime
        )}`}</Typography.Paragraph>
        <Typography.Paragraph>
          {`예약 일정: ${dateInfo.start.format(
            LOCAL_DATE_FORMAT
          )} ~ ${dateInfo.end.format(LOCAL_DATE_FORMAT)}`}
        </Typography.Paragraph>
      </Card>
      <Divider />
      <Typography.Title level={5}>
        {`결제 금액: ${dateInfo.end.diff(dateInfo.start, "day") * room.price}`}
      </Typography.Title>
      <Divider />
      <Typography.Title level={5} style={{ marginBottom: "1.5rem" }}>
        결제수단
      </Typography.Title>
      <PaymentMethod.SelectiveWallet
        selectedMethod={paymentMethod}
        setSelectedMethod={setSelectedMethod}
      />
      <Divider />
      <Button type="primary" onClick={reserveRoom}>
        결제
      </Button>
      <Divider type="vertical" />
      <Button type="primary" danger>
        취소
      </Button>
    </>
  );
};

type RoomSalesType = {
  // id: number;
  // accommodationId: number;
  accommodationName: React.ReactNode;
  name: string;
  price: number;
  inTime: string;
  orders: React.ReactNode;
};

const SalesList = () => {
  const columns: ColumnsType<RoomSalesType> = [
    {
      title: "숙소 이름",
      dataIndex: "accommodationName",
      key: "accommodationName",
    },
    {
      title: "방 이름",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "가격",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "입실 시간",
      dataIndex: "inTime",
      key: "inTime",
    },
    {
      title: "판매내역",
      dataIndex: "orders",
      key: "orders",
    },
  ];
  const [dataSource, setDataSource] = useState<RoomSalesType[]>([]);

  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    size: 10,
  });

  const [total, setTotal] = useState<number>(0);

  const { AccommodationRepository } = useRepository();

  const getData = useCallback(
    async (pagination: PaginationQuery) => {
      const response = await AccommodationRepository.getRoomsByProducer(
        undefined,
        pagination
      );

      if (response.success) {
        const data = response.response as PaginationResponse<RoomType>;
        setTotal(data.total);
        const source = data.data.map((d) => {
          const accommodationName = (
            <Link
              to={`${destinationPath.ACCOMMODATION}/${d.accommodationId}`}
              target="_blank"
            >
              {d.accommodationName}
            </Link>
          );
          const orders = <Link to={`${userPath.SALES}/${d.id}`}>보기</Link>;

          return {
            ...d,
            accommodationName,
            inTime: timeParser(d.inTime),
            key: d.id,
            orders,
          };
        });
        setDataSource(source);
      }
    },
    [AccommodationRepository]
  );

  useEffect(() => {
    getData(pagination);
  }, [getData, pagination]);

  return (
    <>
      <Table
        columns={columns}
        dataSource={dataSource}
        style={{ overflow: "auto" }}
        pagination={{
          pageSize: pagination.size,
          onChange: (page, size) => {
            setPagination({ page, size });
          },
          current: pagination.page,
          total,
        }}
      />
    </>
  );
};

const Room = {
  List,
  Reserve,
  SalesList,
};

export default Room;
