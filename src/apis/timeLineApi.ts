import { request } from "../utils/apiCore";
import PageType from "../types/timeline/PageType";

const TIME_LINE_REQUEST_MAPPING = "api/timesheet/time-line";
const MASTER_DATA_REQUEST_MAPPING = "api/common-code";

export const getListTimeLine = (params: PageType) => {
  return request({
    url: `${TIME_LINE_REQUEST_MAPPING}/get-list-time-line`,
    method: "GET",
    params: params
  });
};

export const createNote = (textNote) => {
  return request({
    url: `${TIME_LINE_REQUEST_MAPPING}/add-note-time-line`,
    method: "POST",
    headers: {
      "Content-Type": "Application/JSON"
    },
    data: textNote
  });
};

export const getDetailTimeSheet = (timeSheetId: String) => {
  return request({
    url: `${TIME_LINE_REQUEST_MAPPING}/get-detail-note-time-line`,
    method: "GET",
    params: timeSheetId
  });
};

export const getListWorkType = (type: String) => {
  return request({
    url: `${MASTER_DATA_REQUEST_MAPPING}/get-master-data`,
    method: "GET",
    params: type
  });
};

export const getListTimeLineForExcelExport = (params: PageType) => {
  return request({
    url: `${TIME_LINE_REQUEST_MAPPING}/export-excel`,
    method: "GET",
    params: params
  });
};
