import React, { useCallback, useEffect, useRef, useState } from "react";
import { theme } from "antd";

import AdvancedSearchForm from "@/components/timesheet/AdvancedSearchForm";
import TimeSheetTable from "@/components/timesheet/TimesheetTable";
import TableDataType from "@/types/TableDataType";
import FormItemEnum from "@/types/timesheet/FormItemEnum";
import ProjectFilterResponse from "@/types/project/ProjectFilterResponse";
import ProjectFilterRequest from "@/types/project/ProjectFilterRequest";

import TimeSheetFilterRequest from "@/types/timesheet/TimeSheetFilterRequest";
import type { TablePaginationConfig } from "antd/es/table";

import { DEFAULT_PAGE } from "@/utils/constants";
import { searchTimeSheet, getTimeSheetDataForExcelExport } from "@/apis/timeSheetAPI";
import { findProjectByNameLike } from "@/apis/serveProject";

import { getCurrentMonthRange } from "@/utils/date";

import dayjs from "dayjs";
import _ from "lodash";

const currentDate = getCurrentMonthRange();

const defaultTimeSheetFilterRequest: TimeSheetFilterRequest = {
  fromDate: currentDate[0],
  toDate: currentDate[1],
  projectIds: [],
  account: "",
  pageNumber: DEFAULT_PAGE.INDEX,
  pageSize: DEFAULT_PAGE.SIZE
};

interface TableParams {
  pagination?: TablePaginationConfig;
}

const defaultTableParams = {
  pagination: {
    current: DEFAULT_PAGE.INDEX + 1,
    pageSize: DEFAULT_PAGE.SIZE
  }
};

const defaultProjectFilterRequest: ProjectFilterRequest = {
  name: "",
  page: DEFAULT_PAGE.INDEX,
  size: DEFAULT_PAGE.SIZE
};
const TimeSheet = () => {
  const { token } = theme.useToken();

  const [listTimeSheet, setListTimeSheet] = useState<Array<TableDataType[]>>([]);
  const [timeSheetFilterRequest, setTimeSheetFilterRequest] = useState<TimeSheetFilterRequest>({ ...defaultTimeSheetFilterRequest });
  const [tableParams, setTableParams] = useState<TableParams>({
    ...defaultTableParams
  });
  const [loadingTable, setLoadingTable] = useState(true);
  const [listProject, setListProject] = useState<Array<ProjectFilterResponse>>([]);

  useEffect(() => {
    fetchTimeSheet(timeSheetFilterRequest);
    return () => {};
  }, [JSON.stringify(timeSheetFilterRequest)]);
  useEffect(() => {
    fetchProject();
    //initialLoadPageData();
  }, []);
  const initialLoadPageData = async () => {
    await fetchProject();
    await setDefaultFilter(listProject);
  };
  const setDefaultFilter = (listProject) => {
    const requestData: TimeSheetFilterRequest = {
      ...defaultProjectFilterRequest,
      projectIds: listProject[0].id
    };
    fetchTimeSheet(requestData);
  };
  const onSubmitSearchForm = (formData) => {
    const requestData: TimeSheetFilterRequest = {
      fromDate: formData[FormItemEnum.FIELD_DATE][0] ? formData[FormItemEnum.FIELD_DATE][0] : currentDate[0],
      toDate: formData[FormItemEnum.FIELD_DATE][1] ? formData[FormItemEnum.FIELD_DATE][1] : currentDate[1],
      projectIds: formData[FormItemEnum.FIELD_PROJECT] && [...formData[FormItemEnum.FIELD_PROJECT]],
      account: formData[FormItemEnum.FIELD_ACCOUNT],
      pageNumber: DEFAULT_PAGE.INDEX,
      pageSize: DEFAULT_PAGE.SIZE
    };
    setTimeSheetFilterRequest(requestData);
  };

  const handleChangeSpaceNote = (note) => {
    if (note) {
      return note.replaceAll("/n/", " ");
    }
  };

  const fetchTimeSheet = useCallback((request = { ...defaultTimeSheetFilterRequest }) => {
    setLoadingTable(true);
    searchTimeSheet(request)
      .then((response: any) => {
        const fromDate = dayjs(request.fromDate).format("YYYY-MM-DD");
        const toDate = dayjs(request.toDate).format("YYYY-MM-DD");

        let timeSheetList: TableDataType[] = response.data.listTimeSheet.map((item: any, index: number) => {
          return {
            key: item.employeeId,
            projectName: item.projectName,
            recordNo: index + 1,
            fullName: item.fullName,
            knoxID: item.knoxID,
            filteredTime: `${fromDate} ~ ${toDate}`,
            wfhDateList: item.wfhDateList,
            otDateList: item.otDateList,
            compensatoryLeaveList: item.compensatoryDateList,
            abnormalLeaveList: item.abnormalLeaveList,
            dayOffList: item.dayOffList,
            note: item.notes
          };
        });
        setListTimeSheet(timeSheetList);
        setTableParams({
          ...tableParams,
          pagination: {
            current: request.pageNumber + 1,
            pageSize: request.pageSize,
            total: response.data.total
          }
        });
      })
      .catch((err: any) => {
        setListTimeSheet([]);
        setTableParams({
          ...defaultTableParams
        });
      })
      .finally(() => {
        setLoadingTable(false);
      });
  }, []);
  const fetchDataExcel = async () => {
    const { data } = await getTimeSheetDataForExcelExport({ ...defaultProjectFilterRequest });
    return data;
  };
  const fetchProject = useCallback((params = { ...defaultProjectFilterRequest }) => {
    findProjectByNameLike(params)
      .then((response: any) => {
        setListProject(response.data);
        // form.setFieldValue(FormItemEnum.FIELD_PROJECT, [response.data[0].id]);
        // form.submit();
      })
      .catch((err: any) => {});
  }, []);
  const onSearchProjectByName = _.debounce((newValue: string) => {
    if (newValue) {
      const params = { ...defaultProjectFilterRequest };
      params.name = newValue;
      fetchProject(params);
    } else {
    }
  }, 1000);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setTimeSheetFilterRequest({
      ...timeSheetFilterRequest,
      pageNumber: pagination.current - 1,
      pageSize: pagination.pageSize
    });
    // timeSheetFilterRequest.current.pageNumber = pagination.current - 1;
    // timeSheetFilterRequest.current.pageSize = pagination.pageSize;
  };
  return (
    <div className="time-sheet page-layout-default">
      <AdvancedSearchForm
        onSearchProjectByName={onSearchProjectByName}
        onSubmitSearchForm={onSubmitSearchForm}
        initialValues={timeSheetFilterRequest}
        listProject={listProject}
      />
      <TimeSheetTable
        loadingTable={loadingTable}
        timeSheetList={listTimeSheet}
        tableParams={tableParams}
        handleTableChange={handleTableChange}
        fetchTimeSheet={fetchTimeSheet}
        fetchDataExcel={fetchDataExcel}
      ></TimeSheetTable>
    </div>
  );
};

export default TimeSheet;
