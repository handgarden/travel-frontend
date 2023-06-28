import { Form, Typography } from "antd";
import { useMemo, useState } from "react";

const useGlobalError = () => {
  const [globalError, setGlobalError] = useState<string>("");

  const GlobalErrorItem = useMemo(
    () =>
      globalError ? (
        <Form.Item>
          <Typography.Text type="danger">{globalError}</Typography.Text>
        </Form.Item>
      ) : null,
    [globalError]
  );

  return {
    globalError,
    setGlobalError,
    GlobalErrorItem,
  };
};

export default useGlobalError;
