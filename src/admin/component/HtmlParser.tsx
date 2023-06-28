import parse from "html-react-parser";

type Props = {
  html: string;
};

const HtmlParser: React.FC<Props> = ({ html }) => {
  const parsed = parse(html, {
    replace: (domNode) => {
      if (domNode.type === "script") {
        return <span>(제거됨)</span>;
      }
    },
  });
  return <>{parsed}</>;
};

export default HtmlParser;
