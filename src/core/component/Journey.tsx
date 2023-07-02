import {
  Button,
  Card,
  Collapse,
  Divider,
  Form,
  Input,
  Modal,
  Pagination,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import useRepository from "../hook/useRepository";
import { Link, useNavigate, useParams } from "react-router-dom";
import BasicProfile from "./BasicProfile";
import { useCallback, useEffect, useMemo, useState } from "react";
import useModalState from "../hook/useModalState";
import { useForm } from "antd/es/form/Form";
import { validationMessages } from "../../lib/validation/validation.message";
import MyCarousel from "./MyCarousel";
import { useAuth } from "../../context/AuthContext";
import {
  CaretRightOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import useRedirectPath from "../hook/useRedirectPath";
import TextArea from "antd/es/input/TextArea";
import {
  ErrorResponse,
  PaginationQuery,
  PaginationResponse,
} from "../../types/repository/basic.type";
import { journeyPath } from "../router/path";
import Description from "./Description";
import {
  JourneyCommentType,
  JourneyCommentUpdateForm,
  JourneyContentType,
  JourneyForm,
  JourneyType,
} from "../../types/Journey.type";
import { getCategoryColor } from "../../lib/const/category";
import useAuthorization from "../hook/useAuthorization";
import TextContent from "./TextContent";
import DestinationLinkButton from "./link/DestinationLinkButton";

type HeaderProps = {
  data: JourneyContentType;
};

const ContentHeader: React.FC<HeaderProps> = ({ data }) => {
  const color = getCategoryColor(data.destination.category);
  return (
    <>
      <Tag color={color}>{data.destination.category.kr}</Tag>
      <Divider type="vertical" />
      <Typography.Text>{`${data.destination.title} (${data.destination.address})`}</Typography.Text>
    </>
  );
};

type AddModalProps = {
  addContent: (data: JourneyContentType) => void;
  content: JourneyContentType[];
  isModalOpen: boolean;
  handleCancel: () => void;
};

const AddContentModal: React.FC<AddModalProps> = ({
  addContent,
  content,
  isModalOpen,
  handleCancel,
}) => {
  const { token } = theme.useToken();
  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
  };

  const { JourneyRepository } = useRepository();

  const [data, setData] = useState<JourneyContentType[]>([]);

  const getData = useCallback(
    async (pageQuery: PaginationQuery) => {
      const response = await JourneyRepository.getJourneyContent(
        undefined,
        pageQuery
      );
      if (!response.success) {
        window.alert("후기를 가져오는데 실패했습니다.");
        return;
      }
      if (response.response) {
        const res = response.response;
        setTotal(res.total ? res.total : 0);
        setData(res.data ? res.data : []);
      }
    },
    [JourneyRepository]
  );

  useEffect(() => {
    getData({ page: 1, size: 5 });
  }, [getData]);

  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    size: 5,
  });

  const [total, setTotal] = useState<number>(0);

  const handlePageChange = (page: number, size: number) => {
    const paginationQuery: PaginationQuery = {
      page,
      size,
    };
    setPagination(paginationQuery);
    getData(paginationQuery);
  };

  return (
    <>
      <Modal
        title="작성한 후기"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[]}
        style={{ maxHeight: "80vh" }}
      >
        <div style={{ maxHeight: "100%", overflowY: "auto" }}>
          <Collapse
            accordion
            bordered={false}
            style={{ background: token.colorBgContainer }}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
          >
            {data.map((d) => (
              <Collapse.Panel
                header={<ContentHeader data={d} />}
                key={d.description.id.toString()}
                style={panelStyle}
                extra={
                  content.find(
                    (c) => c.description.id === d.description.id
                  ) ? null : (
                    <Button
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        addContent(d);
                      }}
                    >
                      +
                    </Button>
                  )
                }
              >
                <Description.Elem
                  data={d.description}
                  deleteElem={() => {}}
                  updateElem={() => {}}
                  hideExtra={true}
                />
              </Collapse.Panel>
            ))}
          </Collapse>
        </div>
        <Pagination
          onChange={handlePageChange}
          current={pagination.page}
          pageSize={pagination.size}
          total={total}
          style={{ display: "flex", justifyContent: "center" }}
          showSizeChanger
          pageSizeOptions={[5, 10, 15, 20]}
        />
      </Modal>
    </>
  );
};

const Add: React.FC = () => {
  const { token } = theme.useToken();

  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
  };

  const [content, setContent] = useState<JourneyContentType[]>([]);

  const { isModalOpen, handleCancel, showModal } = useModalState();

  const addContent = (data: JourneyContentType) => {
    if (content.length > 4) {
      window.alert(
        "후기는 5개까지 추가할 수 있습니다. 다른 후기를 제거하고 다시 시도해주세요."
      );
    } else {
      setContent((prev) => [...prev, data]);
    }
    handleCancel();
  };

  const removeContent = (data: JourneyContentType) => {
    setContent((prev) =>
      prev.filter((p) => p.description.id !== data.description.id)
    );
  };

  const [form] = useForm<{ title: string; review: string }>();

  const [contentError, setContentError] = useState<string>("");

  const { JourneyRepository } = useRepository();

  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const submit = async () => {
    try {
      if (!window.confirm("정말로 추가하시겠습니까 ?")) {
        return;
      }
      const formData = await form.validateFields();
      if (content.length < 1) {
        setContentError("후기를 1개 이상 추가해주세요.");
        return;
      }
      const requestData: JourneyForm = {
        ...formData,
        contents: content.map((c) => c.description.id),
      };
      setLoading(true);
      const response = await JourneyRepository.postJourney(
        requestData,
        undefined,
        undefined
      );
      setLoading(false);
      if (!response.success) {
        window.alert("여정을 추가하는데 실패했습니다");
        return;
      }
      window.alert("여정을 추가했습니다.");
      navigate("/journey");
    } catch (e) {}
  };

  return (
    <>
      <Card title="여정 추가">
        <Form
          layout="vertical"
          form={form}
          validateMessages={validationMessages}
        >
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, type: "string", min: 1, max: 30 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="여행 후기">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <Tag>{content.length} / 5</Tag>
                <Button onClick={showModal}>{"추가"}</Button>
              </Space>
              <AddContentModal
                addContent={addContent}
                isModalOpen={isModalOpen}
                handleCancel={handleCancel}
                content={content}
              />
              {content.length < 1 && contentError ? (
                <Typography.Text type="danger">{contentError}</Typography.Text>
              ) : null}
              <div style={{ margin: ".5rem 0", width: "100%" }}>
                <MyCarousel
                  data={{
                    images: content
                      .map((c) => c.description.images.map((i) => i))
                      .reduce((prev, cur) => {
                        return [...prev, ...cur];
                      }, []),
                  }}
                />
              </div>
              <Collapse
                accordion
                bordered={false}
                style={{ background: token.colorBgContainer }}
                expandIcon={({ isActive }) => (
                  <CaretRightOutlined rotate={isActive ? 90 : 0} />
                )}
              >
                {content.map((d) => (
                  <Collapse.Panel
                    header={<ContentHeader data={d} />}
                    key={d.description.id.toString()}
                    style={panelStyle}
                    extra={
                      <Button
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeContent(d);
                        }}
                      >
                        x
                      </Button>
                    }
                  >
                    <Description.Elem
                      data={d.description}
                      deleteElem={() => {}}
                      updateElem={() => {}}
                      hideExtra={true}
                    />
                  </Collapse.Panel>
                ))}
              </Collapse>
            </Space>
          </Form.Item>
          <Form.Item
            label="내용"
            name="review"
            rules={[{ required: true, type: "string", min: 20, max: 1000 }]}
            initialValue={""}
          >
            <Input.TextArea
              showCount
              style={{ resize: "none", height: "10rem" }}
            />
          </Form.Item>
        </Form>
        <Space>
          <Button onClick={submit} loading={loading}>
            추가
          </Button>
          <Link to="../">
            <Button>취소</Button>
          </Link>
        </Space>
      </Card>
    </>
  );
};

const Edit: React.FC = () => {
  const { token } = theme.useToken();

  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
  };

  const [content, setContent] = useState<JourneyContentType[]>([]);

  const { isModalOpen, handleCancel, showModal } = useModalState();

  const addContent = (data: JourneyContentType) => {
    if (content.length > 4) {
      window.alert(
        "후기는 5개까지 추가할 수 있습니다. 다른 후기를 제거하고 다시 시도해주세요."
      );
    } else {
      setContent((prev) => [...prev, data]);
    }
    handleCancel();
  };

  const removeContent = (data: JourneyContentType) => {
    setContent((prev) =>
      prev.filter((p) => p.description.id !== data.description.id)
    );
  };

  const [form] = useForm<{ title: string; review: string }>();

  const pathVariable = useParams<"id">();

  const { JourneyRepository } = useRepository();

  const { user } = useAuth();

  const navigate = useNavigate();
  const redirectPath = useRedirectPath();

  const getPrevData = useCallback(async () => {
    if (!user) {
      window.alert("로그인이 필요합니다.");
      navigate("/login" + redirectPath);
      return;
    }
    const id = pathVariable.id;
    if (!id) {
      window.alert("수정하려는 데이터를 가져오는데 실패했습니다.");
      return;
    }
    const response = await JourneyRepository.getJourney(id, undefined);
    if (!response.success) {
      window.alert("수정하려는 데이터를 가져오는데 실패했습니다.");
      return;
    }
    const data = response.response as JourneyType;
    if (data.creator.nickname !== user.nickname) {
      window.alert("권한이 없습니다.");
      navigate("../");
      return;
    }
    setContent(data.journeyContents);
    form.setFieldValue("title", data.title);
    form.setFieldValue("review", data.content);
  }, [JourneyRepository, form, navigate, pathVariable.id, redirectPath, user]);

  useEffect(() => {
    getPrevData();
  }, [getPrevData]);

  const [contentError, setContentError] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const submit = async () => {
    const id = pathVariable.id;
    if (!id) {
      window.alert("수정하려는 여정을 찾을 수 없습니다. 다시 시도해주세요.");
      return;
    }
    if (!window.confirm("정말로 수정하시겠습니까?")) {
      return;
    }
    try {
      const formData = await form.validateFields();
      if (content.length < 1) {
        setContentError("후기를 1개 이상 추가해주세요.");
        return;
      }
      const requestData: JourneyForm = {
        ...formData,
        contents: content.map((c) => c.description.id),
      };
      setLoading(true);
      const response = await JourneyRepository.updateJourney(
        requestData,
        pathVariable.id,
        undefined
      );
      setLoading(false);
      if (!response.success) {
        window.alert("여정을 수정하는데 실패했습니다");
        return;
      }
      window.alert("여정을 수정했습니다.");
      navigate("/journey");
    } catch (e) {}
  };

  return (
    <>
      <Card title="여정 수정">
        <Form
          layout="vertical"
          form={form}
          validateMessages={validationMessages}
        >
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, type: "string", min: 1, max: 30 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="여행 후기">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <Tag>{content.length} / 5</Tag>
                <Button onClick={showModal}>{"수정"}</Button>
              </Space>
              <AddContentModal
                addContent={addContent}
                isModalOpen={isModalOpen}
                handleCancel={handleCancel}
                content={content}
              />
              {content.length < 1 && contentError ? (
                <Typography.Text type="danger">{contentError}</Typography.Text>
              ) : null}
              <div style={{ margin: ".5rem 0", width: "100%" }}>
                <MyCarousel
                  data={{
                    images: content
                      .map((c) => c.description.images.map((i) => i))
                      .reduce((prev, cur) => {
                        return [...prev, ...cur];
                      }, []),
                  }}
                />
              </div>
              <Collapse
                accordion
                bordered={false}
                style={{ background: token.colorBgContainer }}
                expandIcon={({ isActive }) => (
                  <CaretRightOutlined rotate={isActive ? 90 : 0} />
                )}
              >
                {content.map((d) => (
                  <Collapse.Panel
                    header={`${d.destination.title} - ${d.destination.address}`}
                    key={d.description.id.toString()}
                    style={panelStyle}
                    extra={
                      <Button
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeContent(d);
                        }}
                      >
                        x
                      </Button>
                    }
                  >
                    <Typography.Paragraph style={{ textAlign: "center" }}>
                      {new Date(d.description.updatedAt)
                        .toLocaleString("ko-KR")
                        .toString()}
                    </Typography.Paragraph>
                    <div>
                      <MyCarousel
                        data={{ images: d.description.images.map((d) => d) }}
                      />
                    </div>
                    <Typography.Paragraph
                      style={{
                        maxWidth: 300,
                        margin: "0 auto",
                        wordWrap: "break-word",
                      }}
                    >
                      <TextContent
                        border={false}
                        data={d.description.content}
                      />
                    </Typography.Paragraph>
                  </Collapse.Panel>
                ))}
              </Collapse>
            </Space>
          </Form.Item>
          <Form.Item
            label="내용"
            name="review"
            rules={[{ required: true, type: "string", min: 20, max: 1000 }]}
          >
            <Input.TextArea
              showCount
              style={{ resize: "none", height: "10rem" }}
            />
          </Form.Item>
        </Form>
        <Space>
          <Button onClick={submit} loading={loading}>
            수정
          </Button>
          <Link to="../">
            <Button>취소</Button>
          </Link>
        </Space>
      </Card>
    </>
  );
};

type ElemProps = {
  data: JourneyType;
};

const Elem: React.FC<ElemProps> = ({ data }) => {
  const { token } = theme.useToken();

  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
  };

  const { JourneyRepository } = useRepository();

  const redirectPath = useRedirectPath();
  const navigate = useNavigate();

  const deleteJourney = useCallback(async () => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) {
      return;
    }
    try {
      const response = await JourneyRepository.deleteJourney(data.id);
      if (!response.success) {
        if (response.error && response.error.status === 401) {
          window.alert("로그인이 필요합니다.");
          navigate("/login" + redirectPath);
          return;
        }

        window.alert("여정을 삭제하는데 실패했습니다.");
        return;
      }
      window.alert("여정을 삭제했습니다.");
      navigate(0);
    } catch (e) {
      window.alert("여정을 삭제하는데 실패했습니다.");
    }
  }, [JourneyRepository, data.id, navigate, redirectPath]);

  const isOwner = useAuthorization(data.creator);

  const extraBtn = useMemo(() => {
    if (!isOwner) {
      return null;
    }

    return (
      <Space>
        <Link to={`${journeyPath.EDIT}/${data.id}`}>
          <Button>
            <EditOutlined />
          </Button>
        </Link>
        <Button onClick={deleteJourney}>
          <DeleteOutlined />
        </Button>
      </Space>
    );
  }, [isOwner, data.id, deleteJourney]);

  return (
    <>
      <Card title={<BasicProfile user={data.creator} />} extra={extraBtn}>
        <Typography.Title level={4} style={{ textAlign: "center" }}>
          {`제목: ${data.title}`}
        </Typography.Title>
        <Typography.Paragraph style={{ textAlign: "center" }}>
          {new Date(data.updatedAt).toLocaleString("ko-KR").toString()}
        </Typography.Paragraph>
        <div style={{ margin: ".5rem 0", width: "100%" }}>
          <MyCarousel
            data={{
              images: data.journeyContents
                .map((c) => c.description.images.map((i) => i))
                .reduce((prev, cur) => {
                  return [...prev, ...cur];
                }, []),
            }}
          />
        </div>
        <Collapse
          accordion
          bordered={false}
          style={{ background: token.colorBgContainer }}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )}
        >
          {data.journeyContents.map((d) => (
            <Collapse.Panel
              header={
                <>
                  <Tag color={getCategoryColor(d.destination.category)}>
                    {d.destination.category.kr}
                  </Tag>
                  <Typography.Text>{d.destination.title}</Typography.Text>
                </>
              }
              key={d.description.id.toString()}
              style={panelStyle}
              extra={
                <DestinationLinkButton
                  type={d.destination.category.type}
                  id={d.destination.id}
                />
              }
            >
              <div>
                <Typography.Paragraph style={{ textAlign: "center" }}>
                  {`주소: ${d.destination.address}`}
                </Typography.Paragraph>
                <Typography.Paragraph style={{ textAlign: "center" }}>
                  {new Date(d.description.updatedAt)
                    .toLocaleString("ko-KR")
                    .toString()}
                </Typography.Paragraph>
                <div>
                  <MyCarousel
                    data={{ images: d.description.images.map((d) => d) }}
                  />
                </div>
                <Typography.Paragraph
                  style={{
                    maxWidth: 300,
                    margin: "0 auto",
                  }}
                >
                  <TextContent data={d.description.content} border={false} />
                </Typography.Paragraph>
              </div>
            </Collapse.Panel>
          ))}
        </Collapse>
        <TextContent data={data.content} />
        <Divider />
        <Collapse>
          <Collapse.Panel header="댓글" key="댓글">
            <JourneyComment journeyId={data.id} />
          </Collapse.Panel>
        </Collapse>
      </Card>
    </>
  );
};

const List: React.FC = () => {
  const [data, setData] = useState<JourneyType[]>([]);

  const { JourneyRepository } = useRepository();

  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    size: 10,
  });

  const [total, setTotal] = useState<number>(0);

  const getData = useCallback(
    async (paginationQuery: PaginationQuery) => {
      const response = await JourneyRepository.getAllJourney(
        undefined,
        paginationQuery
      );
      if (!response.success || !response.response) {
        window.alert("여정을 가져오는데 실패했습니다.");
        return;
      }
      const res = response.response;
      setData(res.data);
      setTotal(res.total);
    },
    [JourneyRepository]
  );

  useEffect(() => {
    getData({ page: 1, size: 10 });
  }, [getData]);

  const handlePageChange = (page: number, size: number) => {
    const paginationQuery: PaginationQuery = {
      page,
      size,
    };
    setPagination(paginationQuery);
    getData(paginationQuery);
  };

  return (
    <>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Link to="./add">
          <Button>여정 추가</Button>
        </Link>
        {data.map((d) => (
          <Elem key={d.id.toString()} data={d} />
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

type AddCommentProps = {
  journeyId: number;
  addComment: (newComment: JourneyCommentType) => void;
};

type AddCommentForm = {
  comment: string;
};

const AddComment: React.FC<AddCommentProps> = ({ journeyId, addComment }) => {
  const { user } = useAuth();

  const [form] = useForm<AddCommentForm>();

  const { JourneyRepository } = useRepository();

  const navigate = useNavigate();
  const redirectPath = useRedirectPath();

  const [loading, setLoading] = useState<boolean>(false);
  form.submit = async () => {
    if (!window.confirm("정말로 추가하시겠습니까?")) {
      return;
    }
    try {
      const formData = await form.validateFields();
      const requestData = {
        journeyId,
        comment: formData.comment,
      };
      setLoading(true);
      const response = await JourneyRepository.postComment(
        requestData,
        journeyId.toString(),
        undefined
      );
      setLoading(false);

      if (!response.success) {
        const error = response.error as ErrorResponse;
        if (error.status === 401) {
          window.alert("로그인이 필요합니다.");
          navigate("/login" + redirectPath);
          return;
        }
        window.alert("댓글을 추가하는데 실패했습니다.");
        return;
      }
      window.alert("댓글을 추가했습니다.");
      addComment(response.response as JourneyCommentType);
      form.setFieldValue("comment", "");
    } catch (e) {}
  };

  if (!user) {
    return (
      <Card>
        <Typography.Paragraph>댓글 추가</Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text type="danger">로그인이 필요합니다.</Typography.Text>
        </Typography.Paragraph>
      </Card>
    );
  }

  return (
    <Card>
      <Form layout="vertical" form={form} validateMessages={validationMessages}>
        <Typography.Paragraph>댓글 추가</Typography.Paragraph>
        <Form.Item
          name="comment"
          rules={[{ required: true, type: "string", min: 10, max: 300 }]}
          initialValue={""}
        >
          <TextArea style={{ resize: "none", height: "8rem" }} showCount />
        </Form.Item>
        <Button htmlType="submit" loading={loading}>
          추가
        </Button>
      </Form>
    </Card>
  );
};

type CommentProps = {
  journeyId: number;
};

const JourneyComment: React.FC<CommentProps> = ({ journeyId }) => {
  const [comments, setComments] = useState<JourneyCommentType[]>([]);

  const { JourneyRepository } = useRepository();

  const addComment = (newComment: JourneyCommentType) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const [pagination, setPagination] = useState<PaginationQuery>({
    page: 1,
    size: 5,
  });

  const [total, setTotal] = useState<number>(0);

  const getData = useCallback(
    async (paginationQuery: PaginationQuery) => {
      const response = await JourneyRepository.getComments(
        journeyId.toString(),
        paginationQuery
      );
      if (response.success) {
        const pResponse =
          response.response as PaginationResponse<JourneyCommentType>;
        setComments(pResponse.data);
        setTotal(pResponse.total);
      }
    },
    [JourneyRepository, journeyId]
  );

  useEffect(() => {
    getData({ page: 1, size: 5 });
  }, [getData]);

  const handlePageChange = (page: number, size: number) => {
    const paginationQuery: PaginationQuery = {
      page,
      size,
    };
    setPagination(paginationQuery);
    getData(paginationQuery);
  };

  const deleteComment = (id: number) => {
    setComments((prev) => prev.filter((p) => p.id !== id));
  };

  const updateComment = (uData: JourneyCommentType) => {
    setComments((prev) =>
      prev.map((p) => {
        if (p.id !== uData.id) {
          return p;
        }

        return uData;
      })
    );
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <AddComment journeyId={journeyId} addComment={addComment} />
      {comments.map((c) => (
        <CommentElem
          data={c}
          key={c.createdAt.toString()}
          deleteComment={deleteComment}
          updateComment={updateComment}
        />
      ))}
      <Pagination
        onChange={handlePageChange}
        current={pagination.page}
        pageSize={pagination.size}
        total={total}
        style={{ display: "flex", justifyContent: "center" }}
        pageSizeOptions={[5, 10, 20, 30]}
      />
    </Space>
  );
};

type CommentElemProps = {
  data: JourneyCommentType;
  deleteComment: (id: number) => void;
  updateComment: (uData: JourneyCommentType) => void;
};

const CommentElem: React.FC<CommentElemProps> = ({
  data,
  deleteComment,
  updateComment,
}) => {
  const { JourneyRepository } = useRepository();

  const navigate = useNavigate();
  const redirectPath = useRedirectPath();

  const deleteElem = useCallback(async () => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }
    try {
      const response = await JourneyRepository.deleteComment(data.id);
      if (!response.success) {
        const error = response.error as ErrorResponse;
        if (error.status === 401) {
          window.alert("로그인이 필요합니다.");
          navigate("/login" + redirectPath);
          return;
        }
        window.alert("댓글을 제거하는데 실패했습니다.");
        return;
      }
      window.alert("댓글을 삭제했습니다.");
      deleteComment(data.id);
    } catch (e) {}
  }, [JourneyRepository, data.id, deleteComment, navigate, redirectPath]);

  const [editStatus, setEditStatus] = useState<boolean>(false);

  const isOwner = useAuthorization(data.creator);

  const extra = useMemo(() => {
    if (!isOwner) {
      return null;
    }

    return (
      <Space>
        <Button
          onClick={() => {
            setEditStatus(true);
          }}
        >
          <EditOutlined />
        </Button>
        <Button onClick={deleteElem}>
          <DeleteOutlined />
        </Button>
      </Space>
    );
  }, [isOwner, deleteElem]);

  const cancle = () => {
    setEditStatus(false);
  };

  if (editStatus) {
    return (
      <EditComment data={data} cancle={cancle} updateComment={updateComment} />
    );
  }

  return (
    <Card
      title={
        <Space>
          <BasicProfile user={data.creator} />
          <Typography.Paragraph style={{ margin: 0 }}>
            {`- ${new Date(data.updatedAt).toLocaleString("ko-kr")}`}
          </Typography.Paragraph>
        </Space>
      }
      extra={extra}
    >
      <TextContent data={data.content} border={false} />
    </Card>
  );
};

type EditCommentProps = {
  data: JourneyCommentType;
  cancle: () => void;
  updateComment: (data: JourneyCommentType) => void;
};

const EditComment: React.FC<EditCommentProps> = ({
  data,
  cancle,
  updateComment,
}) => {
  const [form] = useForm<JourneyCommentUpdateForm>();

  const { JourneyRepository } = useRepository();

  const navigate = useNavigate();
  const redirectPath = useRedirectPath();

  const [loading, setLoading] = useState<boolean>(false);
  form.submit = async () => {
    if (!window.confirm("댓글을 수정하시겠습니까?")) {
      return;
    }
    try {
      const formData = await form.validateFields();
      setLoading(true);
      const response = await JourneyRepository.updateComment(
        formData,
        data.id.toString(),
        undefined
      );
      setLoading(false);
      if (!response.success) {
        const error = response.error as ErrorResponse;
        if (error.status === 401) {
          window.alert("로그인이 필요합니다.");
          navigate("/login" + redirectPath);
          return;
        }
        window.alert("댓글을 수정하는데 실패했습니다.");
        return;
      }
      const resData = response.response as JourneyCommentType;
      window.alert("댓글을 수정했습니다.");
      updateComment(resData);
      cancle();
    } catch (e) {}
  };

  return (
    <Card
      title={
        <Space>
          <BasicProfile user={data.creator} />
          <Typography.Paragraph style={{ margin: 0 }}>
            {`- ${new Date(data.updatedAt).toLocaleString("ko-kr")}`}
          </Typography.Paragraph>
        </Space>
      }
    >
      <Form layout="vertical" form={form} validateMessages={validationMessages}>
        <Typography.Paragraph>댓글 수정</Typography.Paragraph>
        <Form.Item
          name="comment"
          rules={[{ required: true, type: "string", min: 10, max: 300 }]}
          initialValue={data.content}
        >
          <TextArea style={{ resize: "none", height: "8rem" }} showCount />
        </Form.Item>
        <Space>
          <Button htmlType="submit" loading={loading}>
            수정
          </Button>
          <Button onClick={cancle}>취소</Button>
        </Space>
      </Form>
    </Card>
  );
};
const Journey = { List, Add, Edit, Elem, CommentElem };

export default Journey;
