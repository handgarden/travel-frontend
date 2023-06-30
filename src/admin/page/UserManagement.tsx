import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Space,
  Table,
  Typography,
} from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { Link } from "react-router-dom";
import { MemberProfile, ROLE_TYPE } from "../../types/User.type";
import useRepository from "../../core/hook/useRepository";
import RoleTag from "../../core/component/RoleTag";
import roles from "../../lib/const/auth/role";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { UserListQuery } from "../../types/Admin.type";

type DataType = {
  key: string;
} & MemberProfile;

const roleOptions = Object.values(roles)
  .filter((v) => v.id !== 1)
  .map((v) => ({
    label: v.kr,
    value: v.type,
  }));

const columns: ColumnsType<DataType> = [
  {
    title: "권한",
    dataIndex: "role",
    key: "role",
    render: (_, { role }) => (
      <>
        <RoleTag role={role} />
      </>
    ),
  },
  {
    title: "계정",
    dataIndex: "account",
    key: "account",
  },
  {
    title: "닉네임",
    dataIndex: "nickname",
    key: "nickname",
    render: (_, { nickname }) => (
      <>
        <Link to={`/admin/users/${nickname}`}>{nickname}</Link>
      </>
    ),
  },
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<DataType[]>([]);

  const { AdminRepository } = useRepository();

  const [roles, setRoles] = useState<ROLE_TYPE[]>([]);

  const [query, setQuery] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const getData = useCallback(
    async (
      userListQuery: UserListQuery = {
        roles: [],
        query: "",
        page: 1,
        size: 10,
      }
    ) => {
      setLoading(true);
      const response = await AdminRepository.getUserInfoList(
        undefined,
        userListQuery
      );
      setLoading(false);
      if (!response.success) {
        if (response.error && response.error.status !== 401) {
          window.alert("데이터를 가져오는데 문제가 발생했습니다.");
        }
        return;
      }
      const data = response.response;
      if (data) {
        const dataSource: DataType[] = data.data.map((u) => {
          return {
            ...u,
            key: u.nickname,
          };
        });
        setUsers(dataSource);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
        }));
      }
    },
    [AdminRepository]
  );

  const optionChange = (checkedValues: CheckboxValueType[]) => {
    setRoles(checkedValues as ROLE_TYPE[]);
  };

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 1000,
  });

  //total 변경되면 다시 호출됨
  //매 호출마다 total이 바뀜
  useEffect(() => {
    getData({
      roles: [],
      query: "",
      page: 1,
      size: 10,
    });
  }, [getData]);

  const submit = () => {
    const userListQuery: UserListQuery = {
      roles,
      query,
      page: 1,
      size: pagination.pageSize || 10,
    };
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
    getData(userListQuery);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination);
    getData({
      roles,
      query,
      page: pagination.current || 1,
      size: pagination.pageSize || 10,
    });
  };

  return (
    <>
      <Space style={{ backgroundColor: "#fafafa", display: "flex" }}>
        <Space style={{ margin: "1rem" }} direction="vertical">
          <Typography.Title level={4} style={{ margin: ".25rem 0" }}>
            {"검색"}
          </Typography.Title>
          <Form>
            <Form.Item label="권한">
              <Checkbox.Group
                options={roleOptions}
                defaultValue={[]}
                onChange={optionChange}
                style={{ display: "flex", flexWrap: "wrap" }}
              />
            </Form.Item>
            <Form.Item label="검색어" name="query" initialValue="">
              <Input
                type="text"
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
              />
            </Form.Item>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                submit();
              }}
              loading={loading}
            >
              필터
            </Button>
          </Form>
        </Space>
      </Space>
      <Divider />
      <Table
        dataSource={users}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        style={{ overflow: "auto" }}
      />
    </>
  );
};

export default UserManagement;
