import { Descriptions, Pagination, Space, Typography } from "antd";
import { Navigate, useParams } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import AuthContext, { useAuth } from "../../context/AuthContext";
import useRepository from "../hook/useRepository";
import UpdateNickname from "../component/modal/UpdateNickname";
import UpdatePassword from "../component/modal/UpdatePassword";
import Destination from "../component/Destination";
import useRedirectPath from "../hook/useRedirectPath";
import {
  PaginationQuery,
  PaginationResponse,
} from "../../types/repository/basic.type";
import Journey from "../component/Journey";
import { DescriptionType } from "../../types/Description.type";
import Description from "../component/Description";
import { JourneyCommentType, JourneyType } from "../../types/Journey.type";
import { UpdateNicknameForm } from "../../types/User.type";
import PaymentMethod from "../component/PaymentMethod";
import Order from "../component/Order";
import Room from "../component/Room";

const Profile: React.FC = () => {
  const { user, logout, updateNickname } = useContext(AuthContext);

  const { UserRepository } = useRepository();

  if (!user) {
    return <></>;
  }

  return (
    <Descriptions title="프로필" bordered column={1}>
      <Descriptions.Item label="계정">{user.account}</Descriptions.Item>
      <Descriptions.Item label="닉네임">
        <Typography.Text style={{ marginRight: "1rem" }}>
          {user.nickname}
        </Typography.Text>
        <UpdateNickname
          userData={user}
          updateNickname={updateNickname}
          postNickname={(data: UpdateNicknameForm) => {
            return UserRepository.postNickname(data, undefined, undefined);
          }}
        />
      </Descriptions.Item>
      <Descriptions.Item label="수정일">
        {new Date(user.updatedAt).toLocaleString("ko-KR")}
      </Descriptions.Item>
      <Descriptions.Item label="비밀번호">
        <UpdatePassword logout={logout} />
      </Descriptions.Item>
    </Descriptions>
  );
};

const DestinationPage: React.FC = () => {
  const { user } = useAuth();

  const redirectPath = useRedirectPath();

  if (!user) {
    window.alert("로그인이 필요합니다.");
    return <Navigate to={"/login" + redirectPath} />;
  }

  // todo - nickname으로 변경
  return (
    <>
      <Destination.DestinationList forUser />
    </>
  );
};

const DescriptionPage: React.FC = () => {
  const { user } = useAuth();

  const redirectPath = useRedirectPath();

  const { UserRepository } = useRepository();

  const [data, setData] = useState<DescriptionType[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    size: 10,
  });

  //todo - 닉네임으로 변경 확인
  const getData = useCallback(
    async (pagination: PaginationQuery) => {
      if (!user) {
        return;
      }
      const response = await UserRepository.getUserDescriptions(
        undefined,
        pagination
      );
      if (!response.success) {
        window.alert("데이터를 가져오는데 실패했습니다.");
        return;
      }
      const data = response.response as PaginationResponse<DescriptionType>;
      setData(data.data);
      setTotal(data.total);
    },
    [UserRepository, user]
  );

  useEffect(() => {
    getData({ page: 1, size: 10 });
  }, [getData]);

  const handlePageChange = (page: number, size: number) => {
    const pg = {
      page,
      size,
    };
    setPagination(pg);
    getData(pg);
  };

  if (!user) {
    window.alert("로그인이 필요합니다.");
    return <Navigate to={"/login" + redirectPath} />;
  }

  return (
    <Space size="large" direction="vertical" style={{ width: "100%" }}>
      {data.map((d) => (
        <Description.Elem
          key={d.id.toString()}
          data={d}
          deleteElem={() => {
            setData((prev) => prev.filter((p) => p.id !== d.id));
          }}
          updateElem={(data) => {
            setData((prev) =>
              prev.map((p) => {
                if (p.id !== data.id) {
                  return p;
                }
                return data;
              })
            );
          }}
        />
      ))}
      <Pagination
        style={{ display: "flex", justifyContent: "center" }}
        total={total}
        current={pagination.page}
        onChange={handlePageChange}
        pageSize={pagination.size}
        showSizeChanger
      />
    </Space>
  );
};

const JourneyPage: React.FC = () => {
  const { user } = useAuth();

  const { UserRepository } = useRepository();

  const [total, setTotal] = useState<number>(0);

  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    size: 10,
  });

  const [data, setData] = useState<JourneyType[]>([]);

  const getData = useCallback(
    async (pagination: PaginationQuery) => {
      if (!user) {
        return;
      }
      //todo - nickname으로 변경 확인
      const response = await UserRepository.getUserJourneys(
        undefined,
        pagination
      );

      if (!response.success) {
        window.alert("데이터를 가져오는데 실패했습니다.");
        return;
      }
      const data = response.response as PaginationResponse<JourneyType>;
      setData(data.data);
      setTotal(data.total);
    },
    [UserRepository, user]
  );

  useEffect(() => {
    getData({ page: 1, size: 10 });
  }, [getData]);

  const handlePageChange = (page: number, size: number) => {
    const pg = {
      page,
      size,
    };
    setPagination(pg);
    getData(pg);
  };

  return (
    <Space size="large" direction="vertical" style={{ width: "100%" }}>
      {data.map((d) => (
        <Journey.Elem data={d} key={d.id.toString()} />
      ))}
      <Pagination
        style={{ display: "flex", justifyContent: "center" }}
        total={total}
        current={pagination.page}
        onChange={handlePageChange}
        pageSize={pagination.size}
        showSizeChanger
      />
    </Space>
  );
};

const CommentPage: React.FC = () => {
  const { user } = useAuth();

  const { UserRepository } = useRepository();

  const [total, setTotal] = useState<number>(0);

  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    size: 10,
  });

  const [data, setData] = useState<JourneyCommentType[]>([]);

  const getData = useCallback(
    async (pagination: PaginationQuery) => {
      if (!user) {
        return;
      }
      //todo - 닉네임으로 변경 확인
      const response = await UserRepository.getUserComments(
        undefined,
        pagination
      );

      if (!response.success) {
        window.alert("데이터를 가져오는데 실패했습니다.");
        return;
      }
      const data = response.response as PaginationResponse<JourneyCommentType>;
      setData(data.data);
      setTotal(data.total);
    },
    [UserRepository, user]
  );

  useEffect(() => {
    getData({ page: 1, size: 10 });
  }, [getData]);

  const handlePageChange = (page: number, size: number) => {
    const pg = {
      page,
      size,
    };
    setPagination(pg);
    getData(pg);
  };

  return (
    <Space size="large" direction="vertical" style={{ width: "100%" }}>
      {data.map((d) => (
        <Journey.CommentElem
          data={d}
          key={d.id.toString()}
          deleteComment={() => {}}
          updateComment={() => {}}
        />
      ))}
      <Pagination
        style={{ display: "flex", justifyContent: "center" }}
        total={total}
        current={pagination.page}
        onChange={handlePageChange}
        pageSize={pagination.size}
        showSizeChanger
      />
    </Space>
  );
};

const PaymentMethodPage: React.FC = () => {
  return (
    <>
      <Typography.Title level={5} style={{ marginBottom: "1rem" }}>
        결제수단
      </Typography.Title>
      <PaymentMethod.Wallet />
    </>
  );
};

const OrderPage: React.FC = () => {
  return (
    <>
      <Typography.Title level={5} style={{ marginBottom: "1rem" }}>
        결제내역
      </Typography.Title>
      <Order.List />
    </>
  );
};

const SalesPage: React.FC = () => {
  return (
    <>
      <Typography.Title level={5} style={{ marginBottom: "1rem" }}>
        판매내역
      </Typography.Title>
      <Room.SalesList />
    </>
  );
};

const SalesDetailPage: React.FC = () => {
  const id = useParams().id;

  if (!id) {
    return null;
  }

  return (
    <>
      <Typography.Title level={5} style={{ marginBottom: "1rem" }}>
        판매내역 - 상세
      </Typography.Title>
      <Order.SalesList roomId={parseInt(id)} />
    </>
  );
};

const UserPage = {
  Profile,
  Description: DescriptionPage,
  Destination: DestinationPage,
  Journey: JourneyPage,
  Comment: CommentPage,
  PaymentMethod: PaymentMethodPage,
  Order: OrderPage,
  Sales: SalesPage,
  SalesDetail: SalesDetailPage,
};

export default UserPage;
