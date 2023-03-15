import { request } from "../utils/apiCore";
import { API_BASE_EMPLOYEE } from "../utils/constants";
import EmployeeInsertRequest from "../types/employee/EmployeeInsertRequest";

export const getEmployeeManager = (params?: any) => {
  return request({
    url: `${API_BASE_EMPLOYEE}/all`,
    method: "GET",
    params
  });
};
export const addEmployeeManager = (params: any) => {
  return request({
    url: `${API_BASE_EMPLOYEE}/create`,
    method: "POST",
    data: params
  });
};
export const editEmployeeManager = (params: any) => {
  return request({
    url: `${API_BASE_EMPLOYEE}/${params.id}`,
    method: "PUT",
    data: params
  });
};
export const deleteEmployeeManager = (params: any) => {
  return request({
    url: `${API_BASE_EMPLOYEE}/${params}`,
    method: "DELETE"
  });
};
export const findEmployeeByName = (params: any) => {
  return request({
    url: `${API_BASE_EMPLOYEE}/find-employee-by-name`,
    method: "GET",
    params
  });
};

export const multipleInsertFromExelData = (params: Array<EmployeeInsertRequest>) => {
  return request({
    url: `${API_BASE_EMPLOYEE}/multiple-insert`,
    method: "POST",
    data: params
  });
};
