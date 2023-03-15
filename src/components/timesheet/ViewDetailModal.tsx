import { API_DOWNLOAD_FILE, DEFAULT_TIME_VALUE_TIME_LINE, TIME_LINE_PICKER_FORMAT } from "../../utils/constants/TimeLineConstants";
import { Button, Modal, Popconfirm, Space, Table, Tooltip, notification } from "antd";
import { CloudDownloadOutlined, DeleteFilled, EditFilled } from "@ant-design/icons/lib/icons";
import React, { useEffect, useState } from "react";
import { createNote, getDetailTimeSheet } from "../../apis/timeLineApi";

import { ColumnsType } from "antd/es/table";
import DialogCreateNote from "../timeline/DialogCreateNote";
import { exportExcel } from "../exportExcel";
import TableDataType from "../../types/timesheet/TableDataType";
import dayjs from "dayjs";

// import exportExcel from "@/exportExcel";

const ViewDetailModal = (props) => {
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
      key: "wfh",
      align: "center",
      width: 200
    },
    {
      title: "OT Dates Detail",
      dataIndex: "otDateList",
      key: "otDate",
      align: "center",
      width: 200
    },
    {
      title: "Compensatory Leaves Detail",
      dataIndex: "compensatoryDateList",
      key: "compensatoryDate",
      align: "center",
      width: 200
    },
    {
      title: "Abnormal Leaves Detail",
      dataIndex: "abnormalLeaveList",
      key: "abnormalLeaveList",
      align: "center",
      width: 200
    },
    {
      title: "Day Offs Detail",
      dataIndex: "dayOffList",
      key: "dayOff",
      align: "center",
      width: 200
    },
    {
      title: "Note",
      dataIndex: "notes",
      key: "notes",
      width: 200
    },
    {
      title: "Action",
      key: "operation",
      fixed: "right",
      align: "center",
      width: 180,
      render: (row, text, index) => (
        <Space size="middle">
          <Tooltip placement="top" title={"Delete Record"}>
            <Popconfirm
              placement="bottomLeft"
              title={"Do you want to delete this record"}
              onConfirm={() => {
                handleDeleteRecordTimesheetDetail(row);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button style={{ color: "rgb(244 67 53)" }} id="buttonCustom">
                <DeleteFilled /> DELETE
              </Button>
            </Popconfirm>
          </Tooltip>
          <Tooltip placement="top" title={"Edit information"}>
            <Button
              onClick={() => {
                handleShowDialogEditNote(row);
              }}
              id="buttonCustom"
            >
              <EditFilled /> EDIT
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];
  const { show, data, handleOk, handleCancel, deleteRecord, fullName, getListViewDetailExportExcel } = props;
  const [dataDetail, setDataDetail] = useState([]);
  const [dataExportExcelDetail, setDataExportExcelDetailDetail] = useState([]);
  const [showDialogEditNote, setShowDialogEditNote] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [stateDay, setStateDay] = useState({});
  useEffect(() => {
    const listDataDetail = data?.map((item, index) => {
      return {
        recordNo: index + 1,
        fullName: item.fullName,
        knoxID: item.knoxID,
        projectName: item.projectName,
        wfhDateList: item.wfhDateList,
        otDateList: item.otDateList,
        compensatoryDateList: item.compensatoryDateList,
        abnormalLeaveList: item.abnormalLeaveList,
        dayOffList: item.dayOffList,
        notes: item.notes,
        timeSheetId: item.timeSheetId
      };
    });
    setDataDetail(listDataDetail);
  }, [data]);

  const handleExportExcel = async () => {
    const data = await getListViewDetailExportExcel();
    exportExcel(convertDataToExportExcel(data), `TimeSheetReport_${fullName}`);
  };
  const handleDeleteRecordTimesheetDetail = (row) => {
    const listAfter = [];
    dataDetail.filter((item, index) => {
      if (item.recordNo !== row.recordNo) {
        listAfter.push(item);
      }
    });
    listAfter.forEach((item, index) => {
      item["recordNo"] = index + 1;
    });
    setDataDetail(listAfter);
    deleteRecord(row.timeSheetId);
  };

  const openNotificationWithIcon = (type: NotificationType, content: NotificationContent) => {
    api[type]({
      message: content.message,
      description: content.description
    });
  };

  const handleShowDialogEditNote = async (row) => {
    try {
      const timeSheetId = row.timeSheetId ? row.timeSheetId : "";
      const response = await getDetailTimeSheet({ timeSheetId });
      const dataConvertoRef = response.data;
      const timeIn = dataConvertoRef.timeIn ? dataConvertoRef.timeIn : DEFAULT_TIME_VALUE_TIME_LINE.TIME_IN;
      const timeOut = dataConvertoRef.timeOut ? dataConvertoRef.timeOut : DEFAULT_TIME_VALUE_TIME_LINE.TIME_OUT;
      const OtFrom = dataConvertoRef.otFrom ? dataConvertoRef.otFrom : DEFAULT_TIME_VALUE_TIME_LINE.OT_FROM;
      const OtTo = dataConvertoRef.otTo ? dataConvertoRef.otTo : DEFAULT_TIME_VALUE_TIME_LINE.OT_TO;
      const overTimeHours = dataConvertoRef.overtimeHours ? dataConvertoRef.overtimeHours : DEFAULT_TIME_VALUE_TIME_LINE.OT_TIME_OVER;
      const fileListData = dataConvertoRef.attachments ? dataConvertoRef.attachments : [];
      const listFileMapper = fileListData.map((item, index) => {
        return {
          uid: index + 1,
          name: item,
          status: "Done",
          url: `${API_DOWNLOAD_FILE}?fileName=${item}`
        };
      });

      const formDataConvert = {
        ...dataConvertoRef,
        workingType: dataConvertoRef.workingType,
        timeInOut: [dayjs(timeIn, TIME_LINE_PICKER_FORMAT), dayjs(timeOut, TIME_LINE_PICKER_FORMAT)],
        otTime: [dayjs(OtFrom, TIME_LINE_PICKER_FORMAT), dayjs(OtTo, TIME_LINE_PICKER_FORMAT)],
        overTimeHours: dayjs(OtFrom, overTimeHours),
        missingMinutes: dataConvertoRef.missingMinutes,
        lateComingMinutes: dataConvertoRef.lateComingMinutes,
        earlyLeavingMinutes: dataConvertoRef.lateComingMinutes,
        notes: dataConvertoRef.notes,
        attachments: listFileMapper
      };
      setStateDay(formDataConvert);
      setShowDialogEditNote(true);
    } catch (e) {}
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

  const handleCloseDialogEditNote = () => {
    setShowDialogEditNote(false);
  };

  const handleCreateNote = async (textNote) => {
    try {
      await createNote(textNote);
      openNotificationWithIcon("success", { message: "Edit note success fully", description: "" });
      handleCloseDialogEditNote();
    } catch (error) {
      openNotificationWithIcon("error", { message: "Error", description: "Please try again." });
    }
  };

  return (
    <Modal
      open={show}
      onOk={handleOk}
      onCancel={handleCancel}
      title={`Timesheet Detail - ${fullName}`}
      footer={[
        <Button key="close" onClick={handleOk}>
          Close
        </Button>
      ]}
      width={1400}
    >
      {contextHolder}
      <br />
      <Space style={{ display: "flex", justifyContent: "end" }}>
        <Button icon={<CloudDownloadOutlined />} type="primary" onClick={() => handleExportExcel()}>
          Export Excel
        </Button>
      </Space>
      <div>
        <Table style={{ paddingTop: 20 }} columns={columns} dataSource={dataDetail} scroll={{ x: 1500, y: 1000 }} pagination={true} />
      </div>
      <DialogCreateNote
        showDialogCreate={showDialogEditNote}
        handleOk={handleCreateNote}
        handleCancel={handleCloseDialogEditNote}
        stateDay={stateDay}
      />
    </Modal>
  );
};

export default ViewDetailModal;
