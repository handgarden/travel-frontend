import { useCallback, useEffect, useMemo, useState } from "react";
import useRepository from "../hook/useRepository";
import {
  DestinationResponse,
  DestinationType,
} from "../../types/Destination.type";
import { ErrorResponse } from "../../types/repository/basic.type";
import {
  convertObjectIncludeCategory,
  getCategoryColor,
} from "../../lib/const/category";
import { Button, Card, Divider, Space, Tag, Typography } from "antd";
import { DescriptionType } from "../../types/Description.type";
import useRedirectPath from "../hook/useRedirectPath";
import { useNavigate } from "react-router-dom";
import useAuthorization from "../hook/useAuthorization";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Description from "./Description";
import LoadingPage from "../page/LoadingPage";
import Destination from "./Destination";
import Room from "./Room";

type DetailProps = {
  dataId: number;
};

const Detail: React.FC<DetailProps> = ({ dataId }) => {
  const [destination, setDestination] = useState<DestinationType>();

  const { DestinationRepository } = useRepository();

  const [loading, setLoading] = useState<boolean>(false);

  const getDestination = useCallback(async () => {
    setLoading(true);
    const response = await DestinationRepository.getDestination({
      pathVariable: dataId.toString(),
    });
    setLoading(false);
    if (!response.success) {
      window.alert("여행지 데이터를 가져오는데 실패했습니다.");
      return;
    }
    const data = response.response as DestinationResponse;
    setDestination(convertObjectIncludeCategory(data));
  }, [dataId, DestinationRepository]);

  useEffect(() => {
    getDestination();
  }, [getDestination]);

  const title = useMemo(() => {
    if (!destination) {
      return null;
    }
    const color = getCategoryColor(destination.category);
    return (
      <>
        <Tag color={color}>{destination.category.kr}</Tag>
        <Divider type="vertical" />
        <Typography.Text>{destination.title}</Typography.Text>
      </>
    );
  }, [destination]);

  const [descriptions, setDescriptions] = useState<DescriptionType[]>([]);

  const redirectPath = useRedirectPath();
  const navigate = useNavigate();

  const postDelete = useCallback(async () => {
    if (descriptions.length > 0) {
      window.alert("후기가 존재하는 여행지는 제거할 수 없습니다.");
      return;
    }
    if (window.confirm("정말로 제거하시겠습니까?")) {
      const response = await DestinationRepository.deleteDestination(dataId);
      if (!response.success) {
        const error = response.error as ErrorResponse;
        if (error.status === 400) {
          window.alert(
            error.message || "후기가 존재하는 여행지는 제거할 수 없습니다."
          );
        } else if (error.status === 401) {
          window.alert("로그인이 필요합니다.");
          navigate("/login" + redirectPath);
        } else if (error.status === 403) {
          window.alert("제거할 권한이 없습니다.");
        } else {
          window.alert("여행지를 제거하는데 실패했습니다.");
        }
        return;
      }
      window.alert("여행지를 성공적으로 제거했습니다.");
      navigate("/");
    }
  }, [
    descriptions.length,
    DestinationRepository,
    dataId,
    navigate,
    redirectPath,
  ]);

  const [edit, setEdit] = useState<boolean>(false);

  const hasOwn = useAuthorization(destination?.creatorNickname);

  const extra = useMemo(() => {
    if (!destination || !hasOwn) {
      return null;
    }
    return (
      <Space>
        <Button
          onClick={() => {
            if (descriptions.length > 0) {
              window.alert("후기가 존재하는 여행지는 수정할 수 없습니다.");
              return;
            }
            setEdit(true);
          }}
        >
          <EditOutlined />
        </Button>
        <Button onClick={postDelete}>
          <DeleteOutlined />
        </Button>
      </Space>
    );
  }, [destination, hasOwn, postDelete, descriptions.length]);

  if (destination && edit) {
    return (
      <Destination.UpdateForm
        data={destination}
        cancle={() => {
          setEdit(false);
        }}
      />
    );
  }

  return (
    <>
      <Card type="inner" title={title} extra={extra}>
        <Space direction="vertical" style={{ minWidth: "100%" }}>
          <Typography.Paragraph>{`주소: ${
            destination ? destination.address : ""
          }`}</Typography.Paragraph>
          {destination ? (
            <Destination.ElementImages id={destination.id} />
          ) : null}
        </Space>
        <Divider />
        <Room.List dataId={dataId} isOwner={hasOwn} />
        <Description.List
          destinationId={dataId}
          descriptions={descriptions}
          setDescriptions={setDescriptions}
        />
      </Card>
      {loading ? <LoadingPage /> : null}
    </>
  );
};

const Accommodation = {
  Detail,
};

export default Accommodation;
