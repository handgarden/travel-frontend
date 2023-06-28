import { Button } from "antd";
import { Link } from "react-router-dom";
import { CategoryType } from "../../../lib/const/category";
import { destinationPath } from "../../router/path";

type Props = {
  type: CategoryType;
  id: number;
};

const DestinationLinkButton: React.FC<Props> = ({ type, id }) => {
  return (
    <Link target="_blank" to={`${destinationPath[type]}/${id}`}>
      <Button size="small" onClick={(e) => e.stopPropagation()}>
        여행지 보기
      </Button>
    </Link>
  );
};

export default DestinationLinkButton;
