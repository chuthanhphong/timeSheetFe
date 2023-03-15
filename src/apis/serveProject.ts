import { API_BASE_PROJECT } from "../utils/constants";
import { request } from "../utils/apiCore";

export const addProjectManager = (params: any) => {
  return request({
    url: `${API_BASE_PROJECT}/create`,
    method: "POST",
    data: params
  });
};
export const editProjectManager = (params: any) => {
  return request({
    url: `${API_BASE_PROJECT}/${params.id}`,
    method: "PUT",
    data: params
  });
};
export const deleteProjectManager = (params: any) => {
  return request({
    url: `${API_BASE_PROJECT}/${params}`,
    method: "DELETE"
  });
};

export const findProjectByNameLike = (params: any) => {
  return request({
    url: `${API_BASE_PROJECT}/find-project-by-name`,
    method: "GET",
    params
  });
};
export const searchProject = (params: any) => {
  return request({
    url: `${API_BASE_PROJECT}/search-project`,
    method: "GET",
    params
  });
};

export const multipleInsertFromExcelDataProject = (params: any) => {
  return request({
    url: `${API_BASE_PROJECT}/multiple-insert`,
    method: "POST",
    data: params
  });
};
export const getAllProject = () => {
  return request({
    url: `${API_BASE_PROJECT}/all`,
    method: "GET"
  });
};
