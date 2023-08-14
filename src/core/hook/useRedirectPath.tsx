import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import useQueryString from "./useQueryString";
import QueryString from "qs";

const useRedirectPath = () => {
  const location = useLocation();

  const query = useQueryString();

  let qs = QueryString.stringify(query);

  qs = qs ? "?" + qs : qs;

  const redirectPath = useMemo(
    () => "?redirect=" + location.pathname + qs,
    [location.pathname, qs]
  );

  return redirectPath;
};

export default useRedirectPath;
