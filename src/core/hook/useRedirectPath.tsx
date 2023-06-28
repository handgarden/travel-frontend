import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import useQueryString from "./useQueryString";
import QueryString from "qs";

const useRedirectPath = () => {
  const location = useLocation();

  const query = useQueryString();

  const redirectPath = useMemo(
    () => "?redirect=" + location.pathname + `?${QueryString.stringify(query)}`,
    [location.pathname, query]
  );

  return redirectPath;
};

export default useRedirectPath;
