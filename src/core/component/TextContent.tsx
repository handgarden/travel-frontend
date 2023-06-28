import { Typography } from "antd";

type Props = {
  data: string;
  border?: boolean;
};

const TextContent: React.FC<Props> = ({ data, border = true }) => {
  return (
    <Typography.Paragraph style={{ marginBottom: 0 }}>
      <pre
        style={{
          maxHeight: "10rem",
          overflowY: "auto",
          background: "transparent",
          border: border ? undefined : "none",
          margin: 0,
        }}
      >
        {data}
      </pre>
    </Typography.Paragraph>
  );
};

export default TextContent;
