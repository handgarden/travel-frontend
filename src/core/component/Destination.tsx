import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Image,
  Input,
  Pagination,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import Postcode from "./modal/Postcode";
import { useForm } from "antd/es/form/Form";
import { gray } from "@ant-design/colors";
import { validationMessages } from "../../lib/validation/validation.message";
import {
  CATEGORY,
  CategoryType,
  convertObjectIncludeCategory,
  getCategoryColor,
} from "../../lib/const/category";
import useRepository from "../hook/useRepository";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import LoadingPage from "../page/LoadingPage";
import useRedirectPath from "../hook/useRedirectPath";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  ErrorResponse,
  PaginationQuery,
  PaginationResponse,
} from "../../types/repository/basic.type";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { destinationPath } from "../router/path";
import {
  CreateDestinationForm,
  UpdateDestinationForm,
  DestinationType,
  DestinationResponse,
} from "../../types/Destination.type";
import useAuthorization from "../hook/useAuthorization";
import { ItemListQuery, DescriptionType } from "../../types/Description.type";
import Description from "./Description";
import { StoreFileName } from "../../types/File.type";

const AddForm: React.FC = () => {
  const [form] = useForm<CreateDestinationForm>();

  const { DestinationRepository } = useRepository();

  const redirectPath = useRedirectPath();
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const category = useLocation().pathname.split("/")[2];

  form.submit = async () => {
    try {
      const data = await form.validateFields();
      setLoading(true);
      const response = await DestinationRepository.postDestination(data);
      setLoading(false);
      if (!response.success) {
        const error = response.error;
        if (!error) {
          window.alert("오류가 발생했습니다.");
          return;
        }
        if (error.status === 401) {
          const path = "login" + redirectPath;
          window.alert("로그인이 필요합니다");
          return <Navigate to={path} />;
        }
        if (error.message && error.message !== "") {
          setGlobalError(error.message);
          return;
        }
        if (error.bindingErrors && error.bindingErrors.length > 0) {
          const bindingError = error.bindingErrors[0];
          setGlobalError(bindingError.defaultMessage);
          return;
        }
        return;
      }

      window.alert("여행지를 추가했습니다.");
      navigate(destinationPath[category.toUpperCase() as CategoryType]);
    } catch (e) {}
  };

  const handleAddress = (address: string) => {
    form.setFieldValue("address", address);
    form.validateFields();
  };

  const categoryOptions = Object.keys(CATEGORY).map((k) => {
    const key = k as CategoryType;
    const value = CATEGORY[key];
    return {
      label: value.kr,
      value: k,
    };
  });

  useEffect(() => {
    if (category) {
      const categoryObj = CATEGORY[category.toUpperCase() as CategoryType];
      if (categoryObj) {
        form.setFieldValue("category", categoryObj.type);
      }
    }
  }, [category, form]);

  const handleCategory = (category: CategoryType) => {
    form.setFieldValue("category", category);
  };

  return (
    <>
      <Form form={form} layout="vertical" validateMessages={validationMessages}>
        <Form.Item
          name="category"
          label="카테고리"
          rules={[{ required: true }]}
        >
          <Select options={categoryOptions} onChange={handleCategory} />
        </Form.Item>
        <Form.Item
          name="title"
          label="여행지 이름"
          colon
          rules={[{ required: true, type: "string", min: 1, max: 30 }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="address"
          label="주소"
          colon
          rules={[{ required: true, type: "string" }]}
        >
          <Input disabled style={{ color: gray[6] }} />
        </Form.Item>
        <Postcode
          setAddress={(address) => {
            handleAddress(address);
          }}
        />
        <Divider />
        {globalError ? (
          <Form.Item style={{ margin: 0 }}>
            <Typography.Text type="danger">{globalError}</Typography.Text>
          </Form.Item>
        ) : null}
        <Button type="primary" htmlType="submit" loading={loading}>
          추가
        </Button>
      </Form>
    </>
  );
};

type UpdateProps = {
  data: DestinationType;
  cancle: () => void;
};

const UpdateForm: React.FC<UpdateProps> = ({ data, cancle }) => {
  const { DestinationRepository: repository } = useRepository();

  const [form] = useForm<CreateDestinationForm>();

  useEffect(() => {
    form.setFieldValue("category", data.category.type);
    form.setFieldValue("title", data.title);
    form.setFieldValue("address", data.address);
  }, [data.address, data.category, data.title, form]);

  const redirectPath = useRedirectPath();
  const navigate = useNavigate();

  const [globalError, setGlobalError] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  form.submit = async () => {
    try {
      const formData = await form.validateFields();
      if (!window.confirm("정말로 수정하시겠습니까?")) {
        return;
      }
      const requestData: UpdateDestinationForm = {
        ...formData,
      };
      setLoading(true);
      const response = await repository.updateDestination(requestData, {
        pathVariable: data.id.toString(),
      });
      setLoading(false);
      if (!response.success) {
        const error = response.error;
        if (!error) {
          window.alert("오류가 발생했습니다.");
          return;
        }
        if (error.status === 401) {
          const path = "login" + redirectPath;
          window.alert("로그인이 필요합니다");
          return <Navigate to={path} />;
        }
        if (error.message && error.message !== "") {
          setGlobalError(error.message);
          return;
        }
        if (error.bindingErrors && error.bindingErrors.length > 0) {
          const bindingError = error.bindingErrors[0];
          setGlobalError(bindingError.defaultMessage);
          return;
        }
        return;
      }
      window.alert("여행지를 수정했습니다.");
      navigate(0);
    } catch (e) {}
  };

  const handleAddress = (address: string) => {
    form.setFieldValue("address", address);
    form.validateFields();
  };

  const categoryOptions = Object.keys(CATEGORY).map((k) => {
    const key = k as CategoryType;
    const value = CATEGORY[key];
    return {
      label: value.kr,
      value: k,
    };
  });

  const handleCategory = (category: string) => {
    form.setFieldValue("category", category);
  };

  return (
    <>
      <Form form={form} layout="vertical" validateMessages={validationMessages}>
        <Form.Item
          name="category"
          label="카테고리"
          rules={[{ required: true }]}
        >
          <Select options={categoryOptions} onChange={handleCategory} />
        </Form.Item>
        <Form.Item
          name="title"
          label="여행지 이름"
          colon
          rules={[{ required: true, type: "string", min: 1, max: 30 }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="address"
          label="주소"
          colon
          rules={[{ required: true, type: "string" }]}
        >
          <Input disabled style={{ color: gray[6] }} />
        </Form.Item>
        <Postcode
          setAddress={(address) => {
            handleAddress(address);
          }}
        />
        <Divider />
        {globalError ? (
          <Form.Item style={{ margin: 0 }}>
            <Typography.Text type="danger">{globalError}</Typography.Text>
          </Form.Item>
        ) : null}
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            수정
          </Button>
          <Button type="primary" onClick={cancle}>
            취소
          </Button>
        </Space>
      </Form>
    </>
  );
};

type ElementImagesProps = {
  id: number;
  images: PaginationResponse<StoreFileName>;
  setImages: (images: PaginationResponse<StoreFileName>) => void;
};

const ElementImages: React.FC<ElementImagesProps> = ({
  id,
  images,
  setImages,
}) => {
  const { DestinationRepository } = useRepository();

  const getData = useCallback(
    async (paginationQuery: PaginationQuery) => {
      const data = await DestinationRepository.getDestinationThumnails({
        pathVariable: id.toString(),
        query: paginationQuery,
      });
      if (data.success) {
        const pgData = data.response as PaginationResponse<StoreFileName>;
        setImages(pgData);
      }
    },
    [DestinationRepository, id, setImages]
  );

  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    size: 10,
  });

  const handlePageChange = (page: number, size: number) => {
    const pg = {
      page,
      size,
    };
    setPagination(pg);
    getData(pg);
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Space style={{ width: "100%", flexWrap: "wrap" }}>
        {images.data.map((d) => (
          <Image
            key={d}
            src={`${process.env.REACT_APP_IMAGE_BASE_URL}/${d}`}
            width={100}
          />
        ))}
      </Space>
      <Pagination
        onChange={handlePageChange}
        current={pagination.page}
        pageSize={pagination.size}
        total={images.total}
        style={{ display: "flex", justifyContent: "center" }}
        showSizeChanger={images.data.length > 0}
      />
    </Space>
  );
};

type ElementProps = {
  initData: DestinationType;
  deleteData: (id: number) => void;
};

const Element: React.FC<ElementProps> = ({ initData, deleteData }) => {
  const [data, setData] = useState<DestinationType>(initData);

  const setImage = (images: PaginationResponse<StoreFileName>) => {
    setData((prev) => ({
      ...prev,
      images: images,
    }));
  };

  const title = useMemo(() => {
    const color = getCategoryColor(data.category);
    return (
      <>
        <Tag color={color}>{data.category.kr}</Tag>
        <Divider type="vertical" />
        <Link
          to={
            destinationPath.HOME +
            "/" +
            data.category.type.toLowerCase() +
            "/" +
            data.id
          }
        >
          {data.title}
        </Link>
      </>
    );
  }, [data]);

  return (
    <>
      <Card type="inner" title={title} key={data.id.toString()}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Typography.Paragraph>{`주소: ${data.address}`}</Typography.Paragraph>
          <ElementImages
            id={data.id}
            images={data.images}
            setImages={setImage}
          />
        </Space>
      </Card>
    </>
  );
};

const categoryOptions = Object.values(CATEGORY).map((v) => ({
  label: v.kr,
  value: v.type,
}));

type ListProps = {
  category?: CategoryType;
  forUser?: boolean;
};

type QueryForm = {
  categories: CategoryType[];
  query: string;
};

const DestinationList: React.FC<ListProps> = ({ category, forUser }) => {
  const [data, setData] = useState<DestinationType[]>([]);

  const { DestinationRepository: repository, UserRepository } = useRepository();

  const [loading, setLoading] = useState<boolean>(false);

  const getData = useCallback(
    async (query: ItemListQuery) => {
      setLoading(true);
      let response = null;
      if (forUser) {
        response = await UserRepository.getUserDestinations({ query });
      } else {
        response = await repository.getDestinations({ query });
      }
      setLoading(false);
      if (!response.success) {
        window.alert("여행지 데이터를 가져오는데 실패했습니다.");
        return;
      }
      const paginationResponse =
        response.response as PaginationResponse<DestinationResponse>;
      const data = paginationResponse.data.map((d) =>
        convertObjectIncludeCategory(d)
      );
      setData(data);
      setTotal(paginationResponse.total);
    },
    [UserRepository, forUser, repository]
  );

  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    size: 10,
  });

  const [total, setTotal] = useState<number>(0);

  const deleteData = useCallback((id: number) => {
    setData((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const [form] = useForm<QueryForm>();

  useEffect(() => {
    form.setFieldValue("categories", category ? [category] : []);
    form.setFieldValue("query", "");
    const initPage: PaginationQuery = {
      page: 1,
      size: 10,
    };
    setPagination(initPage);
    getData({
      ...initPage,
      categories: category ? [category] : [],
    });
  }, [category, form, getData]);

  const optionChange = (checkedValues: CheckboxValueType[]) => {
    form.setFieldValue("categories", checkedValues);
  };

  const submit = () => {
    const initPage: PaginationQuery = {
      page: 1,
      size: 10,
    };
    setPagination(initPage);
    getData({
      ...initPage,
      categories: form.getFieldValue("categories"),
      query: form.getFieldValue("query"),
    });
  };

  const handlePageChange = (page: number, size: number) => {
    const newPage = {
      page,
      size,
    };
    setPagination(newPage);
    getData({
      ...newPage,
      categories: form.getFieldValue("categories"),
      query: form.getFieldValue("query"),
    });
  };

  return (
    <>
      <Space
        direction="vertical"
        style={{ backgroundColor: "#fafafa", width: "100%", padding: "1rem" }}
      >
        <Space style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography.Title level={4} style={{ margin: ".25rem 0" }}>
            {"검색"}
          </Typography.Title>
          {forUser ? null : (
            <Link
              to={`${destinationPath.HOME}${
                category ? "/" + category.toLowerCase() : ""
              }/add`}
            >
              <Button type="primary">여행지 추가</Button>
            </Link>
          )}
        </Space>
        <Form form={form}>
          {category ? null : (
            <Form.Item label="카테고리">
              <Checkbox.Group
                options={categoryOptions}
                defaultValue={[]}
                onChange={optionChange}
                style={{ display: "flex", flexWrap: "wrap" }}
              />
            </Form.Item>
          )}
          <Form.Item label="검색어" name="query">
            <Input type="text" />
          </Form.Item>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              submit();
            }}
            loading={loading}
          >
            검색
          </Button>
        </Form>
      </Space>
      <Divider />
      <Space direction="vertical" style={{ display: "flex" }} size="middle">
        {data.map((data) => (
          <Element
            initData={data}
            key={data.id.toString()}
            deleteData={deleteData}
          />
        ))}
        {loading ? <LoadingPage /> : null}
        <Pagination
          onChange={handlePageChange}
          current={pagination.page}
          pageSize={pagination.size}
          total={total}
          style={{ display: "flex", justifyContent: "center" }}
          showSizeChanger
        />
      </Space>
    </>
  );
};

type DetailProps = {
  dataId: number;
};

const DestinationDetail: React.FC<DetailProps> = ({ dataId }) => {
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

    setDestination(
      convertObjectIncludeCategory(response.response as DestinationResponse)
    );
  }, [dataId, DestinationRepository]);

  useEffect(() => {
    getDestination();
  }, [getDestination]);

  const setImages = (images: PaginationResponse<string>) => {
    setDestination((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        images: images,
      };
    });
  };

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
  const location = useLocation();
  const split = location.pathname.split("/")[2];

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
      navigate(`/destination/${split || ""}`);
    }
  }, [
    descriptions.length,
    DestinationRepository,
    dataId,
    navigate,
    split,
    redirectPath,
  ]);

  const [edit, setEdit] = useState<boolean>(false);

  const hasOwn = useAuthorization(destination?.creator);

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
      <UpdateForm
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
            <ElementImages
              id={destination.id}
              images={destination.images}
              setImages={setImages}
            />
          ) : null}
        </Space>
        <Divider />
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

const Destination = {
  Element,
  AddForm,
  UpdateForm,
  DestinationDetail,
  DestinationList,
  ElementImages,
};

export default Destination;
