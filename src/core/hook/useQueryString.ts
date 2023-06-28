import qs from "qs";
import { useLocation } from "react-router-dom";

const useQueryString = () => {
  const location = useLocation();
  const query = qs.parse(location.search, { ignoreQueryPrefix: true });

  return query;
};

export default useQueryString;
