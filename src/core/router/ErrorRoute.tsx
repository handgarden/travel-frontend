import { Route } from "react-router-dom"
import ErrorPage from "../page/error/ErrorPage"
import NotFound from "../page/error/NotFound";

const defaultPath = "/error";

export const errorPath = {
  ERROR: defaultPath,
};


const ErrorRoute = ()=>{
  return <>
    <Route path={errorPath.ERROR} element={<ErrorPage/>}/>
    <Route path="*" element={<NotFound />}/>x
  </>
}

export default ErrorRoute;