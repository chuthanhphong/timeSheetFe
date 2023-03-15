import { request } from "../utils/apiCore";
import TimeSheetFormType from "@/types/timesheet/TimeSheetFormType";
import TimeSheetFilterRequest from "@/types/timesheet/TimeSheetFilterRequest";
import ViewDetailTimeSheetRequest from "@/types/timesheet/ViewDetailTimeSheetRequest";

const TIMESHEET_REQUEST_MAPPING = "timesheet";

export const multipleInsertFromExelData = (params: Array<TimeSheetFormType>) => {
  return request({
    url: `${TIMESHEET_REQUEST_MAPPING}/multiple-insert`,
    method: "POST",
    data: params
  });
};

export const searchTimeSheet = (timeSheetFilterRequest: TimeSheetFilterRequest) => {
  return request({
    url: `${TIMESHEET_REQUEST_MAPPING}/search`,
    method: "POST",
    data: timeSheetFilterRequest
  });
};

export const viewDetailsTimeSheet = (viewDetailTimeSheetRequest: ViewDetailTimeSheetRequest) => {
  return request({
    url: `${TIMESHEET_REQUEST_MAPPING}/view-detail`,
    method: "GET",
    params: viewDetailTimeSheetRequest
  });
};

export const deleteTimeSheetRecord = (timeSheetId: string) => {
  return request({
    url: `${TIMESHEET_REQUEST_MAPPING}/delete-record`,
    method: "PUT",
    params: timeSheetId
  });
};

export const getTimeSheetDataForExcelExport = (timeSheetFilterRequest: TimeSheetFilterRequest) => {
  return request({
    url: `${TIMESHEET_REQUEST_MAPPING}/excel`,
    method: "POST",
    data: timeSheetFilterRequest
  });
};

export const getTimeSheetDataViewDetailForExcelExport = (viewDetailTimeSheetRequest: ViewDetailTimeSheetRequest) => {
  return request({
    url: `${TIMESHEET_REQUEST_MAPPING}/excel-view-detail`,
    method: "GET",
    params: viewDetailTimeSheetRequest
  });
};
