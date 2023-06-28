import { Navigate, useLocation, useParams } from "react-router-dom";
import Destination from "../component/Destination";
import { CategoryType } from "../../lib/const/category";

const Home: React.FC = () => {
  const location = useLocation();
  const path: string | undefined = location.pathname.split("/")[2];
  const category = path ? (path.toUpperCase() as CategoryType) : undefined;
  return (
    <>
      <div>
        <Destination.DestinationList category={category} />
      </div>
    </>
  );
};

const Detail: React.FC = () => {
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/404" />;
  }

  return (
    <>
      <Destination.DestinationDetail dataId={parseInt(id)} />
    </>
  );
};

const Add: React.FC = () => {
  return (
    <>
      <Destination.AddForm />
    </>
  );
};

const DestinationPage = {
  Home,
  Detail,
  Add,
};

export default DestinationPage;
