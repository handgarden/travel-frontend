import { Upload } from "antd";
import ImgCrop from "antd-img-crop";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import React, { useMemo, useState } from "react";
import useRepository from "../hook/useRepository";
import { MyUploadFile } from "../../types/File.type";
import {
  ErrorResponse,
  ResponseTemplate,
} from "../../types/repository/basic.type";
import { useNavigate } from "react-router-dom";
import useRedirectPath from "../hook/useRedirectPath";
import { JWT_KEY } from "../../types/Auth.type";

export interface MyUploadChangeParam {
  file: MyUploadFile;
  fileList: MyUploadFile[];
  event?: {
    percent: number;
  };
}

type Props = {
  fileList: MyUploadFile[];
  setFileList: React.Dispatch<React.SetStateAction<MyUploadFile[]>>;
  fakeDelete?: boolean;
};

const ImageUpload: React.FC<Props> = ({
  fileList,
  setFileList,
  fakeDelete = false,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const redirectPath = useRedirectPath();

  const onChange: UploadProps["onChange"] = (data: MyUploadChangeParam) => {
    const file = data.file;
    if (file.status === "uploading") {
      setLoading(true);
    } else {
      setLoading(false);
    }
    let fileList = data.fileList;
    if (file.response && !file.response.success) {
      const err = file.response.error as ErrorResponse;
      if (err.status === 401) {
        window.alert("로그인이 필요합니다.");
        navigate(`/login${redirectPath}`);
        return;
      }
      fileList = fileList.map((f) => {
        if (f.uid !== file.uid) {
          return f;
        }
        return {
          ...f,
          status: "error",
        };
      });
    }
    setFileList(fileList);
    return;
  };

  const onPreview = async (file: UploadFile<string>) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as RcFile);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const { FileRepository } = useRepository();

  const onRemove = useMemo(() => {
    if (fakeDelete) {
      return () => {};
    }
    return async (file: MyUploadFile) => {
      const response = file.response as ResponseTemplate<string[]>;
      if (!response.response || response.response.length < 0) {
        return;
      }
      setLoading(true);
      await FileRepository.postRemove(response.response[0]);
      setLoading(false);
    };
  }, [FileRepository, fakeDelete]);

  return (
    <ImgCrop rotationSlider>
      <Upload
        action={`${process.env.REACT_APP_API_HOST}/files`}
        withCredentials
        headers={{ authorization: `bearer ${localStorage.getItem(JWT_KEY)}` }}
        accept=".jpg, .jpeg, .png"
        listType="picture-card"
        fileList={fileList}
        onChange={onChange}
        onPreview={onPreview}
        onRemove={onRemove}
        disabled={loading}
      >
        {fileList.length < 5 && "+ Upload"}
      </Upload>
    </ImgCrop>
  );
};

export default ImageUpload;
