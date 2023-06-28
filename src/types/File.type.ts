import { UploadFile } from "antd";
import { ResponseTemplate } from "./repository/basic.type";
export type StoreFileName = string;

export type MyUploadFile = UploadFile<ResponseTemplate<StoreFileName[]>>;
