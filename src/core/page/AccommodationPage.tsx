import { Navigate, useParams } from "react-router-dom";
import Accommodation from "../component/Accommodation";
import Room from "../component/Room";

const Detail: React.FC = () => {
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/404" />;
  }

  return (
    <>
      <Accommodation.Detail dataId={parseInt(id)} />
    </>
  );
};

const ReserveRoom: React.FC = () => {
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/404" />;
  }

  return (
    <>
      <Room.Reserve roomId={parseInt(id)} />
    </>
  );
};

const AccommodationPage = {
  Detail,
  ReserveRoom,
};

export default AccommodationPage;
