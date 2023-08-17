import {
  Button,
  Card,
  Collapse,
  Divider,
  Form,
  Input,
  Pagination,
  Space,
  Typography,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import useRepository from "../hook/useRepository";
import { useForm } from "antd/es/form/Form";
import { useAuth } from "../../context/AuthContext";
import useRedirectPath from "../hook/useRedirectPath";
import { useNavigate } from "react-router-dom";
import ImageUpload from "./ImageUpload";
import useGlobalError from "../hook/useGlobalError";
import { validationMessages } from "../../lib/validation/validation.message";
import BasicProfile from "./BasicProfile";
import MyCarousel from "./MyCarousel";
import {
  DescriptionType,
  DescriptionForm,
  DescriptionUpdateForm,
} from "../../types/Description.type";
import useAuthorization from "../hook/useAuthorization";
import TextContent from "./TextContent";
import {
  PaginationQuery,
  ResponseTemplate,
} from "../../types/repository/basic.type";
import { MyUploadFile } from "../../types/File.type";

type AddDescriptionProps = {
  destinationId: number;
  addDescription: (description: DescriptionType) => void;
};

type AddDescriptionForm = {
  content: string;
};

const Add: React.FC<AddDescriptionProps> = ({
  destinationId,
  addDescription,
}) => {
  const [form] = useForm<AddDescriptionForm>();

  const Panel = Collapse.Panel;

  const [open, setOpen] = useState<string[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setOpen([]);
    }
  }, [user]);

  const redirectPath = useRedirectPath();
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<MyUploadFile[]>([]);

  const { setGlobalError, GlobalErrorItem } = useGlobalError();

  const { DestinationRepository } = useRepository();

  const [loading, setLoading] = useState<boolean>(false);

  const submit = async () => {
    try {
      const data = await form.validateFields();
      const storeFileNames = fileList
        .filter((s) => s && (s.status === "done" || s.status === "success"))
        .filter(
          (s) =>
            s.response && s.response.response && s.response.response.length > 0
        )
        .map((f) => {
          const response = f.response as ResponseTemplate<string[]>;
          const data = response.response as string[];
          return data[0];
        }) as string[];
      //사진, 글 없는 경우
      const charCount = data.content?.length || 0;
      if (charCount < 1 && storeFileNames.length < 1) {
        setGlobalError("사진을 추가하거나 설명을 작성해주세요.");
        return;
      }
      //사진 없이 글을 작성했는데 20글자 이하로 입력한 경우
      if (storeFileNames.length < 1 && charCount < 20) {
        setGlobalError("20자 이상 입력해주세요.");
        return;
      }
      setGlobalError("");
      const requestData: DescriptionForm = {
        ...data,
        destinationId,
        storeFileNames,
      };
      setLoading(true);
      const response = await DestinationRepository.postDescription(
        requestData,
        { pathVariable: destinationId.toString() }
      );
      setLoading(false);
      if (!response.success) {
        if (response.error && response.error.status === 401) {
          window.alert("로그인이 필요합니다.");
          navigate("/login" + redirectPath);
          return;
        }
        window.alert(
          "후기를 추가하는데 오류가 발생했습니다. 다시 시도해주세요."
        );
        return;
      }
      const description = response.response as DescriptionType;
      addDescription(description);
      window.alert("후기를 추가했습니다");
      setGlobalError("");
      setFileList([]);
      form.setFieldValue("content", "");
      setOpen([]);
      //TODO - form에 설정된 데이터 날리고, 후기 리스트에 데이터 추가
    } catch (e) {}
  };

  return (
    <Collapse
      activeKey={open}
      onChange={(v) => {
        if (v.length > 0 && !user) {
          window.alert("로그인이 필요합니다.");
          navigate("/login" + redirectPath);
          setOpen([]);
          return;
        }
        setOpen(v as string[]);
      }}
    >
      <Panel header="후기 추가" key="1">
        <Form
          form={form}
          layout="vertical"
          validateMessages={validationMessages}
        >
          <ImageUpload fileList={fileList} setFileList={setFileList} />
          <Form.Item
            name="content"
            style={{ marginBottom: 0 }}
            initialValue={""}
          >
            <Input.TextArea
              showCount={true}
              style={{ resize: "none", height: "10rem" }}
            />
          </Form.Item>
        </Form>
        {GlobalErrorItem}
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

type EditProps = {
  data: DescriptionType;
  cancle: () => void;
  updateDescription: (description: DescriptionType) => void;
};

const Edit: React.FC<EditProps> = ({ data, cancle, updateDescription }) => {
  const [form] = useForm<AddDescriptionForm>();

  const [fileList, setFileList] = useState<MyUploadFile[]>([]);

  useEffect(() => {
    const files = data.images.map((storeFileName) => {
      const file: MyUploadFile = {
        uid: storeFileName,
        name: storeFileName,
        status: "done",
        url: `${process.env.REACT_APP_IMAGE_BASE_URL}/${storeFileName}`,
        response: {
          success: true,
          response: [storeFileName],
          error: null,
        },
      };
      return file;
    });
    setFileList(files);
    form.setFieldValue("content", data.content);
  }, [data.creator, data.content, data.images, form]);

  const { setGlobalError, GlobalErrorItem } = useGlobalError();

  const { DescriptionRepository } = useRepository();

  const redirectPath = useRedirectPath();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const submit = async () => {
    if (!window.confirm("정말 수정하시겠습니까?")) {
      return;
    }
    const formData = await form.validateFields();
    const storeFileNames = fileList
      .filter((s) => s && (s.status === "done" || s.status === "success"))
      .filter(
        (s) =>
          s.response && s.response.response && s.response.response.length > 0
      )
      .map((f) => {
        const response = f.response as ResponseTemplate<string[]>;
        const data = response.response as string[];
        return data[0];
      });
    //사진, 글 없는 경우
    const charCount = formData.content.length;
    if (charCount < 1 && storeFileNames.length < 1) {
      setGlobalError("사진을 추가하거나 설명을 작성해주세요.");
      return;
    }
    //사진 없이 글을 작성했는데 20글자 이하로 입력한 경우
    if (storeFileNames.length < 1 && charCount < 20) {
      setGlobalError("20자 이상 입력해주세요.");
      return;
    }
    setGlobalError("");
    const requestData: DescriptionUpdateForm = {
      ...formData,
      storeFileNames,
    };
    setLoading(true);
    const response = await DescriptionRepository.updateDescription(
      requestData,
      { pathVariable: data.id.toString() }
    );
    setLoading(false);
    if (!response.success) {
      if (response.error && response.error.status === 401) {
        window.alert("로그인이 필요합니다.");
        navigate("/login" + redirectPath);
        return;
      }
      window.alert("후기를 수정하는데 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }
    const description = response.response as DescriptionType;
    updateDescription(description);
    window.alert("후기를 수정했습니다");
    cancle();
  };

  return (
    <Card
      key={data.id.toString()}
      type="inner"
      title={<BasicProfile user={data.creator} />}
    >
      <Form form={form} layout="vertical" validateMessages={validationMessages}>
        <ImageUpload fileList={fileList} setFileList={setFileList} fakeDelete />
        <Form.Item name="content" style={{ marginBottom: 0 }} initialValue={""}>
          <Input.TextArea
            showCount={true}
            style={{ resize: "none", height: "10rem" }}
          />
        </Form.Item>
        {GlobalErrorItem}
      </Form>
      <Space>
        <Button onClick={submit} loading={loading}>
          수정
        </Button>
        <Button onClick={cancle}>취소</Button>
      </Space>
    </Card>
  );
};

type DeleteProps = {
  descriptionId: number;
  deleteElem: (descriptionId: number) => void;
};

const Delete: React.FC<DeleteProps> = ({ descriptionId, deleteElem }) => {
  const { DescriptionRepository } = useRepository();

  const redirectPath = useRedirectPath();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const postDelete = async () => {
    if (window.confirm("정말로 제거하시겠습니까?")) {
      setLoading(true);
      const response = await DescriptionRepository.deleteDescription(
        descriptionId
      );
      setLoading(false);
      if (!response.success) {
        if (response.error && response.error.status === 401) {
          window.alert("로그인이 필요합니다.");
          navigate("/login" + redirectPath);
          return;
        }
        window.alert("제거하는데 실패했습니다.");
        return;
      }

      window.alert("성공적으로 제거했습니다.");
      deleteElem(descriptionId);
    }
  };

  return (
    <>
      <Button onClick={postDelete} loading={loading}>
        <DeleteOutlined />
      </Button>
    </>
  );
};

type ElemProps = {
  data: DescriptionType;
  deleteElem: () => void;
  updateElem: (updatedDescription: DescriptionType) => void;
  hideExtra?: boolean;
};

const Elem: React.FC<ElemProps> = ({
  data,
  deleteElem,
  updateElem,
  hideExtra = false,
}) => {
  const [edit, setEdit] = useState<boolean>(false);

  const isOwner = useAuthorization(data.creator.nickname);

  const extraButton = useMemo(() => {
    if (hideExtra) {
      return null;
    }
    if (!isOwner) {
      return null;
    }
    return (
      <Space>
        <Button
          onClick={() => {
            setEdit(true);
          }}
        >
          <EditOutlined />
        </Button>
        <Delete descriptionId={data.id} deleteElem={deleteElem} />
      </Space>
    );
  }, [isOwner, data.id, deleteElem, hideExtra]);

  if (edit) {
    return (
      <Edit
        data={data}
        cancle={() => {
          setEdit(false);
        }}
        updateDescription={updateElem}
      />
    );
  }

  return (
    <Card
      key={data.id.toString()}
      type="inner"
      title={
        <Space>
          <BasicProfile user={data.creator} />
          <Divider type="vertical" />
          <Typography.Paragraph style={{ margin: 0 }}>
            {new Date(data.updatedAt).toLocaleString("ko-KR").toString()}
          </Typography.Paragraph>
        </Space>
      }
      extra={extraButton}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {data.images.length > 0 ? (
          <div>
            <MyCarousel data={{ images: data.images }} />
          </div>
        ) : null}
        <Typography.Paragraph
          style={{ maxWidth: 300, margin: "0 auto", wordWrap: "break-word" }}
        >
          {/* {data.content} */}
          <TextContent data={data.content} border={false} />
        </Typography.Paragraph>
      </Space>
    </Card>
  );
};

type ListProps = {
  destinationId: number;
  setDescriptions: React.Dispatch<React.SetStateAction<DescriptionType[]>>;
  descriptions: DescriptionType[];
};

const List: React.FC<ListProps> = ({
  destinationId,
  setDescriptions,
  descriptions,
}) => {
  const [total, setTotal] = useState<number>(0);
  const addDescription = (description: DescriptionType) => {
    setDescriptions((prev) => {
      if (!prev) {
        return prev;
      }

      return [description, ...prev];
    });
    setTotal((prev) => prev + 1);
  };

  const deleteDescription = (description: DescriptionType) => {
    return () => {
      setDescriptions((prev) => {
        if (!prev) {
          return prev;
        }

        return prev.filter((d) => d.id !== description.id);
      });
      setTotal((prev) => prev - 1);
    };
  };

  const updateDescription = (prevDescription: DescriptionType) => {
    return (updatedDescription: DescriptionType) => {
      setDescriptions((prev) => {
        if (!prev) {
          return prev;
        }
        return prev.map((d) => {
          if (d.id === updatedDescription.id) {
            return updatedDescription;
          }
          return d;
        });
      });
    };
  };

  const { DestinationRepository } = useRepository();

  const getDescriptions = useCallback(
    async (paginationQuery: PaginationQuery) => {
      const response = await DestinationRepository.getDescriptions({
        pathVariable: destinationId.toString(),
        query: paginationQuery,
      });
      if (!response.success) {
        window.alert("후기를 가져오는데 실패했습니다.");
        return;
      }
      const paginationResponse = response.response;

      if (!paginationResponse) {
        return;
      }

      setDescriptions(paginationResponse.data);
      setTotal(paginationResponse.total);
    },
    [DestinationRepository, destinationId, setDescriptions]
  );

  useEffect(() => {
    getDescriptions({ page: 1, size: 10 });
  }, [getDescriptions]);

  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    size: 10,
  });

  const handlePageChange = (page: number, size: number) => {
    const paginationQuery: PaginationQuery = {
      page,
      size,
    };
    setPagination(paginationQuery);
    getDescriptions(paginationQuery);
  };

  return (
    <>
      <Space
        direction="vertical"
        size="large"
        style={{ maxWidth: "100%", minWidth: "100%" }}
      >
        <Typography.Title level={5} style={{ textAlign: "center" }}>
          후기
        </Typography.Title>
        <Add destinationId={destinationId} addDescription={addDescription} />
        {descriptions.map((d) => (
          <Description.Elem
            key={d.id.toString()}
            data={d}
            deleteElem={deleteDescription(d)}
            updateElem={updateDescription(d)}
          />
        ))}
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

const Description = {
  Add,
  Elem,
  List,
};

export default Description;
