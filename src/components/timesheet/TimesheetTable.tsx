import { Button, Modal, notification, Space, Table, Tooltip } from "antd";
import { CloudUploadOutlined, DeleteOutlined, FormOutlined, InboxOutlined, MailOutlined, PaperClipOutlined } from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";
import { deleteTimeSheetRecord, multipleInsertFromExelData, viewDetailsTimeSheet } from "@/apis/timeSheetAPI";
import { read, utils } from "xlsx";

import type { ColumnsType } from "antd/es/table";
import { DEFAULT_PAGE } from "@/utils/constants";
import { Email_Status } from "@/utils/emailConstants";
import { CloudDownloadOutlined, EyeOutlined } from "@ant-design/icons/lib/icons";
import ManualImportModal from "./ManualImportModal";
import { NotificationPlacement } from "antd/es/notification/interface";
import TableDataType from "@/types/timesheet/TableDataType";
import TimeSheetFormType from "@/types/timesheet/TimeSheetFormType";
import TimesheetCSS from "./Timesheet.module.css";
import ViewDetailModal from "./ViewDetailModal";
import ViewDetailTimeSheetRequest from "@/types/timesheet/ViewDetailTimeSheetRequest";
import { getTimeSheetDataViewDetailForExcelExport } from "@/apis/timeSheetAPI";
import { sendMail } from "@/apis/sendMailAPI";

import { exportExcel } from "../exportExcel";

type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationContent {
  message: string;
  description: string;
}

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const TimeSheetTable: React.FC = ({ timeSheetList, handleTableChange, tableParams, loadingTable, fetchDataExcel }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [showManualImportModal, setShowManualImportModal] = useState(false);
  const [uploadFile, setUploadFile] = useState();
  const timeSheetInsertFormList = useRef<Array<TimeSheetFormType>>([]);
  const [api, contextHolder] = notification.useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataViewDetail, setDataViewDetailViewDetail] = useState();
  const [userIds, setUserIds] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSendMailAll, setLoadingSendMailAll] = useState(false);
  const [loadingSendMail, setLoadingSendMail] = useState(false);
  const [rowData, setRowData] = useState({});
  const [fullNameDetail, setFullNameDetail] = useState("");
  const [startDateParam, setStartDateParam] = useState(null);
  const [endDateParam, setEndDateParam] = useState(null);
  const [paramToExportExcel, setParamToExportExcel] = useState({});

  useEffect(() => {
    return () => {
      uploadFile && URL.revokeObjectURL(uploadFile.preview);
    };
  }, [uploadFile]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setUserIds(newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const showDialogViewDetailTimeSheet = async (value) => {
    setRowData(value);
    const startDate = value.filteredTime ? value.filteredTime.split("~")[0].trim() : "";
    const endDate = value.filteredTime ? value.filteredTime.split("~")[1].trim() : "";
    const params: ViewDetailTimeSheetRequest = {
      employeeId: value.key,
      startDate: startDate,
      endDate: endDate,
      page: DEFAULT_PAGE.INDEX,
      pageSize: DEFAULT_PAGE.SIZE
    };
    const paramToExportExcel = {
      employeeId: value.key,
      startDate: startDate,
      endDate: endDate
    };
    setParamToExportExcel(paramToExportExcel);
    try {
      setLoading(true);
      const response = await viewDetailsTimeSheet(params);
      setDataViewDetailViewDetail(response.data);
      setStartDateParam(startDate);
      setEndDateParam(endDate);
      if (response.data) {
        setFullNameDetail(response.data[0].fullName);
      }
    } catch (error) {
    } finally {
      setIsModalOpen(true);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowManualImportModal(false);
  };

  const items = [
    { key: "1", label: <a onClick={() => showDialogViewDetailTimeSheet(rowData)}>View Detail</a> },
    { key: "2", label: "Delete" }
  ];

  const columns: ColumnsType<TableDataType> = [
    {
      title: "Record No",
      dataIndex: "recordNo",
      key: "recordNo",
      align: "center",
      width: 80,
      fixed: "left"
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 120,
      ellipsis: true,
      fixed: "left"
    },
    {
      title: "KnoxID",
      dataIndex: "knoxID",
      fixed: "left",
      width: 120,
      key: "knoxID"
    },
    {
      title: "Project Name",
      dataIndex: "projectName",
      key: "projectName",
      ellipsis: true,
      width: 150,
      fixed: "left"
    },
    {
      title: "WFH Dates Detail",
      dataIndex: "wfhDateList",
      key: "wfhDateList",
      align: "center",
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (list) => <> {columnsCustomRender(list)}</>
    },
    {
      title: "OT Dates Detail",
      dataIndex: "otDateList",
      key: "otDateList",
      align: "center",
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (list) => <> {columnsCustomRender(list)}</>
    },
    {
      title: "Compensatory Leaves Detail",
      dataIndex: "compensatoryLeaveList",
      key: "compensatoryLeaveList",
      align: "center",
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (list) => <> {columnsCustomRender(list)}</>
    },
    {
      title: "Abnormal Leaves Detail",
      dataIndex: "abnormalLeaveList",
      key: "abnormalLeaveList",
      align: "center",
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (list) => <> {columnsCustomRender(list)}</>
    },
    {
      title: "Day Offs Detail",
      dataIndex: "dayOffList",
      key: "dayOffList",
      align: "center",
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (list) => <> {columnsCustomRender(list)}</>
    },
    {
      title: "Note",
      dataIndex: "notes",
      key: "notes",
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (list) => <> {columnsCustomRender(list)}</>
    },
    {
      title: "Action",
      key: "operation",
      fixed: "right",
      align: "center",
      width: 140,
      render: (_, record: { key: React.Key }) => (
        <Button
          className="buttonCustom-view"
          id="buttonCustom"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.preventDefault();
            showDialogViewDetailTimeSheet(record);
          }}
        >
          View Detail
        </Button>
      )
    }
  ];

  const columnsCustomRender = (list) => {
    const displayText = list?.replaceAll("/n/", "\n");
    return (
      <Tooltip overlayInnerStyle={{ whiteSpace: "pre-line" }} color="rgb(26, 115, 232)" placement="topLeft" title={displayText}>
        {displayText}
      </Tooltip>
    );
    // return list ? list.split("/n/").map((item, index) => <span key={index}>{item}</span>) : "";
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const openNotification = (placement: NotificationPlacement, description) => {
    api.info({
      message: `Notification`,
      description: description,
      placement
    });
  };
  const makeEmailRequest = (isSendAll: boolean) => {
    const { filteredTime } = timeSheetList[0];
    const listUserId = timeSheetList.filter((timeSheetData) => timeSheetData.abnormalLeaveList).map((timeSheetData) => timeSheetData.key);
    const year = parseInt(filteredTime.substring(0, 4), 10);
    const month = parseInt(filteredTime.substring(6, 7), 10);

    return isSendAll ? { year, month, userIds: listUserId, isSendAll } : { year, month, userIds, isSendAll };
  };
  const sendMailHandle = (e: React.MouseEvent<HTMLElement>) => {
    const emailRequest = makeEmailRequest(false);
    setLoadingSendMail(true);
    sendMail(emailRequest)
      .then((res: any) => {
        openNotify(res ? res.data : Email_Status.NO_DATA);
        setLoadingSendMail(false);
      })
      .catch((err) => {
        openNotify(Email_Status.FAIL);
        setLoadingSendMail(false);
      });
    setUserIds([]);
    setSelectedRowKeys([]);
  };
  const sendMailAllHandle = (e: React.MouseEvent<HTMLElement>) => {
    const emailRequest = makeEmailRequest(true);
    setLoadingSendMailAll(true);
    sendMail(emailRequest)
      .then((res: any) => {
        openNotify(res ? res.data : Email_Status.NO_DATA);
        setLoadingSendMailAll(false);
      })
      .catch((err) => {
        openNotify(Email_Status.FAIL);
        setLoadingSendMailAll(false);
      });
    setUserIds([]);
    setSelectedRowKeys([]);
  };

  const openNotify = (res) => {
    if (res === Email_Status.NO_DATA) {
      openNotificationWithIcon("info", { message: "Notification", description: "No data to send" });
    } else if (res === Email_Status.DONE) {
      openNotificationWithIcon("success", { message: "Notification", description: "Email sent successfully!" });
    } else if (res === Email_Status.FAIL) {
      openNotificationWithIcon("error", { message: "Notification", description: "Email sent fail" });
    }
  };
  const showModalExcelImport = () => {
    setShowExcelImportModal(true);
  };
  const showModalManualImport = () => {
    setShowManualImportModal(true);
  };

  const handleExcelImportModalOk = (e: React.MouseEvent<HTMLElement>) => {
    if (!timeSheetInsertFormList.current.length) {
      openNotificationWithIcon("warning", { message: "Please upload an excel file!", description: "" });
      return;
    }
    setLoading(true);
    multipleInsertFromExelData(timeSheetInsertFormList.current)
      .then((res: any) => {
        openNotificationWithIcon("success", { message: res.data, description: "" });
        handleRemoveFile();
        timeSheetInsertFormList.current = [];
        setShowExcelImportModal(false);
        setLoading(false);
      })
      .catch((err) => {
        openNotificationWithIcon("error", { message: err.response.data, description: "Please try again." });
        setLoading(false);
      });
  };

  const handleExcelModalImportCancel = (e: React.MouseEvent<HTMLElement>) => {
    handleRemoveFile();
    setShowExcelImportModal(false);
    setLoading(false);
  };

  const handleUploadFile = ($event) => {
    const files = $event.target.files;
    if (files.length) {
      const file = files[0];
      file.preview = URL.createObjectURL(file);
      setUploadFile(file);
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const wb = read(event.target.result);
        const sheets = wb.SheetNames;
        //Map raw excel data to list for api insert
        if (sheets.length) {
          const rows = utils.sheet_to_json(wb.Sheets[sheets[0]], { raw: false, blankrows: false });
          const timsheetFormList = rows.map((item: any) => {
            const formItem: TimeSheetFormType = {
              workingDate: new Date(item["Date"]),
              fullName: item["Name"],
              userId: Number(item["User ID"]),
              du: item["Du"],
              project: item["Project"],
              timeIn: item["In"] === "-" ? "" : item["In"],
              timeOut: item["Out"] === "-" ? "" : item["Out"],
              exception: item["Exception"],
              regularHours: item["Regular hours"],
              overTimeHours: item["Overtime hours"],
              totalWorkHours: item["Total Work Hours"],
              knoxId: item["KnoxID"] || "",
              ldap: item["Ldap"] || ""
            };
            return formItem;
          });
          timeSheetInsertFormList.current = timsheetFormList;
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  const handleRemoveFile = () => {
    setUploadFile(null);
  };

  const handleDeleteRecordById = async (timeSheetId: String) => {
    try {
      const response = await deleteTimeSheetRecord({ timeSheetId: timeSheetId });
      openNotificationWithIcon("success", { message: response.data, description: "" });
    } catch (err) {
      openNotificationWithIcon("error", { message: "An unexpected error occurred", description: "Please try again." });
    }
  };

  const handleReloadViewDetails = (employeeId: Number) => {
    const params: ViewDetailTimeSheetRequest = {
      employeeId: employeeId,
      startDate: startDate,
      endDate: endDate,
      page: DEFAULT_PAGE.INDEX,
      pageSize: DEFAULT_PAGE.SIZE
    };
  };

  const openNotificationWithIcon = (type: NotificationType, content: NotificationContent) => {
    api[type]({
      message: content.message,
      description: content.description
    });
  };

  const handleExportExcel = async () => {
    const data = await fetchDataExcel();
    exportExcel(convertDataToExportExcel(data.listTimeSheet), "TimeSheet Report");
  };

  const getListViewDetailExportExcel = async () => {
    const { data } = await getTimeSheetDataViewDetailForExcelExport({ ...paramToExportExcel });
    return data;
  };

  const convertDataToExportExcel = (listData) => {
    return listData.map((item, index) => {
      return {
        "Employee ID": item.employeeId,
        "Full Name": item.fullName,
        "Knox Id": item.knoxID,
        "Project Name": item.projectName,
        "WFH Dates Detail": item.wfhDateList,
        "OT Dates Detail": item.otDateList,
        "Compensatory Leaves Detail": item.compensatoryLeaveList,
        "Abnormal Leaves Detail": item.abnormalLeaveList,
        "Day Offs Detail": item.dayOffList
      };
    });
  };

  return (
    <div style={{ marginTop: "16px" }} className="ant-card ant-card-table">
      {contextHolder}
      <div className={TimesheetCSS.timeSheetAction}>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" loading={loadingSendMailAll} onClick={sendMailAllHandle} icon={<MailOutlined />}>
            Send All Email
          </Button>
          <Button
            disabled={!userIds || (userIds && userIds.length === 0)}
            loading={loadingSendMail}
            onClick={sendMailHandle}
            icon={<MailOutlined />}
          >
            Send Email
          </Button>
        </Space>
        <Space style={{ marginBottom: 16 }}>
          <Button onClick={showModalExcelImport} icon={<CloudUploadOutlined />}>
            Excel Import
          </Button>
          <Button onClick={showModalManualImport} icon={<FormOutlined />}>
            Manual Import
          </Button>
          <Button icon={<CloudDownloadOutlined />} type="primary" onClick={() => handleExportExcel()}>
            Export Excel
          </Button>
          {/* <ExportExcel data={listExportExcel} nameFile="TimeSheetReport" /> */}
        </Space>
      </div>

      <Table
        loading={loadingTable}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={timeSheetList}
        scroll={{ x: 1500, y: 450 }}
        onChange={handleTableChange}
        pagination={tableParams.pagination}
        bordered
      />
      <Modal
        title={
          <div
            style={{
              width: "100%",
              cursor: "move"
            }}
            onFocus={() => {}}
            onBlur={() => {}}
          >
            Excel Import
          </div>
        }
        open={showExcelImportModal}
        onOk={handleExcelImportModalOk}
        onCancel={handleExcelModalImportCancel}
        footer={[
          <Button key="back" onClick={handleExcelModalImportCancel}>
            Return
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleExcelImportModalOk}>
            Submit
          </Button>
        ]}
      >
        <div className="custom-file-input-wrapper">
          <div className={`${TimesheetCSS["custom-file-input"]}`}>
            <input
              type="file"
              name="file"
              id="inputGroupFile"
              required
              onChange={handleUploadFile}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              hidden
              value={""}
            />
            <label htmlFor="inputGroupFile">
              <p>
                <InboxOutlined style={{ fontSize: "54px", color: "#08c" }}></InboxOutlined>
              </p>
              <p className={TimesheetCSS["custom-file-input-text"]}>Click or drag file to this area to upload</p>
              <p className={TimesheetCSS["custom-file-input-hint"]}>
                Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files
              </p>
            </label>
          </div>
          {uploadFile && (
            <div className={TimesheetCSS["custom-file-input-uploaded"]}>
              <PaperClipOutlined />
              <a href={uploadFile.preview} className="file-name">
                {uploadFile.name}
              </a>
              <DeleteOutlined onClick={handleRemoveFile} style={{ fontSize: "16px", cursor: "pointer", paddingLeft: "5px" }} />
            </div>
          )}
        </div>
      </Modal>
      <ViewDetailModal
        show={isModalOpen}
        data={dataViewDetail}
        handleOk={closeModal}
        fullName={fullNameDetail}
        handleCancel={closeModal}
        endDateParam={endDateParam}
        startDateParam={startDateParam}
        deleteRecord={handleDeleteRecordById}
        getListViewDetailExportExcel={getListViewDetailExportExcel}
      ></ViewDetailModal>
      <ManualImportModal showDialogManualImport={showManualImportModal} handleOk={closeModal} handleCancel={closeModal}></ManualImportModal>
    </div>
  );
};

export default TimeSheetTable;
