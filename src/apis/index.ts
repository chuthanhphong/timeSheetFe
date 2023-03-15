import { request } from "../utils/apiCore";

export const getTimeSheet = (params: any) => {
  return request({
    url: "/timesheet",
    method: "GET",
    params
  });
};
export const getDataDashboard = (params: any) => {
  return request({
    url: "/dashboard/all",
    method: "GET",
    params
  });
};
