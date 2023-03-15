import { request } from "../utils/apiCore";

const CONSTANTS_REQUEST_MAPPING = "/api/file";
export const uploadFile = (params: File) => {
  const formData = new FormData();
  formData.append("file", params);
  return request({
    url: `${CONSTANTS_REQUEST_MAPPING}/upload`,
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const downloadFile = (fileName: string) => {
  return request({
    url: `${CONSTANTS_REQUEST_MAPPING}/downloadFile`,
    method: "GET",
    params: fileName
  });
};
