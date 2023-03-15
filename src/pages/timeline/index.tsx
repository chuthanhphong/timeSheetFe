import "./style.css";
import "./CustomTableStyle.css";

import {
  API_DOWNLOAD_FILE,
  COLOR_ROW_WORKING_MODE,
  DAY_OF_WEEK,
  DEFAULT_TIME_VALUE_TIME_LINE,
  NOTE_WORK_TYPE,
  TIME_LINE_PICKER_FORMAT
} from "../../utils/constants/TimeLineConstants";
import { Button, Col, DatePicker, Form, Input, notification, Popover, Row, Segmented, Select, Space, Table, theme, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { CloudDownloadOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { createNote, getDetailTimeSheet, getListTimeLine, getListTimeLineForExcelExport } from "../../apis/timeLineApi";
import { disableDateSelectAfterToday, getCurrentMonthRange } from "@/utils/date";

import { ColumnsType } from "antd/es/table";
import { DEFAULT_PAGE } from "../../utils/constants";
import DateType from "../../types/timeline/DateType";
import DialogCreateNote from "../../components/timeline/DialogCreateNote";
import { exportExcel } from "../../components/exportExcel";
import ProjectFilterRequest from "../../types/project/ProjectFilterRequest";
import ProjectFilterResponse from "../../types/project/ProjectFilterResponse";
import TableDataType from "../../types/timeline/TimeLineTable";
import TimesheetCSS from "../../components/timesheet/Timesheet.module.css";
import _ from "lodash";
import dayjs from "dayjs";
import { findProjectByNameLike } from "../../apis/serveProject";
import PageType from "types/timeline/PageType";

type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationContent {
  message: string;
  description: string;
}

const initColumns: ColumnsType<TableDataType> = [
  {
    title: "STT",
    width: 90,
    dataIndex: "index",
    key: "index",
    fixed: "left",
    align: "center",
    render: (id, record, index) => {
      return <span>{index + 1}</span>;
    }
  },
  {
    title: "Full Name",
    width: 150,
    dataIndex: "employeeName",
    key: "employeeName",
    fixed: "left",
    align: "center",
    render: (id, record, index) => {
      return <span style={{ marginLeft: "12px" }}>{record.employeeName}</span>;
    }
  },
  {
    title: "DU",
    width: 150,
    dataIndex: "du",
    key: "DU",
    fixed: "left",
    sorter: false,
    align: "center",
    render: (id, record, index) => {
      return <span style={{ marginLeft: "12px" }}>{record.du}</span>;
    }
  },
  {
    title: "Project",
    width: 150,
    dataIndex: "project",
    key: "projectName",
    fixed: "left",
    sorter: false,
    align: "center",
    render: (id, record, index) => {
      return <span style={{ marginLeft: "12px" }}>{record.project}</span>;
    }
  }
];

const defaultProjectFilterRequest: ProjectFilterRequest = {
  name: "",
  page: DEFAULT_PAGE.INDEX,
  size: DEFAULT_PAGE.SIZE
};

const initAdvancdeColumns: any = [
  {
    title: () => {
      return <span style={{ color: "#525233FF" }}> Leave Unpaid Note</span>;
    },
    key: "noteLeaveUnpaid",
    width: 170,
    dataIndex: "noteLeaveUnpaid",
    align: "center",
    ellipsis: {
      showTitle: false
    },
    render: (id, record, index) => {
      return renderListNote(record.noteLeaveUnpaid);
    }
  },

  {
    title: () => {
      return <span style={{ color: "#666666" }}>OT Time Note</span>;
    },
    key: "noteOTTime",
    width: 150,
    dataIndex: "noteOTTime",
    align: "center",
    ellipsis: {
      showTitle: false
    },
    render: (id, record, index) => {
      return renderListNote(record.noteOTTime);
    }
  },
  {
    title: () => {
      return <span style={{ color: "#FF3333", width: "100%" }}>Leave Annual Leave </span>;
    },
    key: "noteLeaveAnnual",
    width: 150,
    dataIndex: "noteLeaveAnnual",
    align: "center",
    ellipsis: true,
    render: (id, record, index) => {
      return renderListNote(record.noteLeaveAnnual);
    }
  },
  {
    title: () => {
      return <span style={{ width: "100%" }}>Other note </span>;
    },
    key: "notes",
    width: 150,
    dataIndex: "notes",
    align: "center",
    ellipsis: true,
    render: (id, record, index) => {
      return renderListNote(record.notes.split(","));
    }
  }
];

const renderListNote = (listNote) => {
  return (
    <div>
      <Popover
        placement="top"
        content={listNote.map((item, index) => {
          return <div key={index}>{item}</div>;
        })}
        trigger="hover"
      >
        <span style={{ cursor: "pointer" }}>{listNote[0] ? listNote[0] : ""}</span>
      </Popover>
    </div>
  );
};

const { RangePicker } = DatePicker;

const currentDate = getCurrentMonthRange();

const Timeline: React.FC = () => {
  const [isShowDialogCreateNote, setIsShowDialogCreateNote] = useState(false);

  const [dataList, setDataList] = useState([]);

  const [loading, setLoading] = useState(false);

  const [projectList, setProjectList] = useState<Array<ProjectFilterResponse>>([]);

  const [page, setPage] = useState(0);

  const [columns, setColumns] = useState(initColumns);

  const [api, contextHolder] = notification.useNotification();

  const [stateDay, setStateDay] = useState("");
  const [paramToSearch, setParamToSearch] = useState({});

  const [tableParams, setTableParams] = useState<any>({
    pagination: {
      current: DEFAULT_PAGE.INDEX + 1,
      pageSize: DEFAULT_PAGE.SIZE
    }
  });

  useEffect(() => {
    handleGetListProject();
  }, []);

  useEffect(() => {
    form.submit();
    fetchDataListTimeLine(paramToSearch);
  }, [JSON.stringify(paramToSearch)]);

  const hanldeCloseDialogCreateNote = () => {
    setIsShowDialogCreateNote(false);
  };

  const openNotificationWithIcon = (type: NotificationType, content: NotificationContent) => {
    api[type]({
      message: content.message,
      description: content.description
    });
  };

  const handleGetListProject = async (params = { ...defaultProjectFilterRequest }) => {
    try {
      const res = await findProjectByNameLike(params);
      setProjectList(res.data);
      form.setFieldValue("projectId", res.data[0].id);
    } catch (error) {
      openNotificationWithIcon("error", { message: "", description: "Please try again." });
    }
  };

  const onSearchProjectByName = _.debounce((newValue: string) => {
    if (newValue) {
      const params = { ...defaultProjectFilterRequest };
      params.name = newValue;
      handleGetListProject(params);
    } else {
    }
  }, 1000);

  const fetchDataListTimeLine = async (param) => {
    setLoading(true);
    try {
      const res = await getListTimeLine(param);
      setTableParams({
        ...tableParams,
        pagination: {
          current: param.page + 1,
          pageSize: param.pageSize
        }
      });
      const data = transformDataToSetList(res.data.listEmployee);
      setDataList(data);
    } catch (error) {
      // openNotificationWithIcon("error", { message: error.response.data, description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const transformDataToSetList = (listWorkDay) => {
    let result = listWorkDay.map((workDay) => {
      let dataItem = {
        du: workDay.du,
        project: workDay.project,
        employeeId: workDay.employeeId,
        email: workDay.email,
        ldap: workDay.ldap,
        notes: workDay.notes,
        projectId: workDay.projectId,
        employeeName: workDay.employeeName,
        noteLeaveAnnual: workDay.noteLeaveAnnual,
        noteLeaveUnpaid: workDay.noteLeaveUnpaid,
        noteOTTime: workDay.noteOTTime,
        otherNote: workDay.notes
      };
      workDay.workdaysResponseList.forEach((item, index) => {
        dataItem[`workday${item.strDateKey.split("-")[2]}${item.strDateKey.split("-")[1]}`] = {
          timeSheetId: item.timeSheetId,
          workingDate: item.workingDate,
          workingType: item.workingType,
          timeIn: item.timeIn,
          timeOut: item.timeOut,
          employeeId: item.employeeId,
          regularHours: item.regularHours,
          overtimeHours: item.overtimeHours,
          otFrom: item.otFrom,
          otTo: item.otTo,
          missingMinutes: item.missingMinutes,
          notes: item.notes,
          attachments: item.attachments,
          color: COLOR_ROW_WORKING_MODE[item.timeLineStatus],
          timeLineStatus: item.timeLineStatus,
          strDateKey: item.strDateKey
        };
      });
      return dataItem;
    });
    return result;
  };

  const convertDataToExportExcel = (data) => {
    let result = data.map((item, index) => {
      let dataItem = {
        "Employee ID": item.employeeId,
        "Full Name": item.employeeName,
        DU: item.du,
        Project: item.project,
        Email: item.email,
        LDAP: item.ldap
      };
      item.workdaysResponseList.forEach((item, index) => {
        dataItem[`${item.strDateKey.split("-")[2]}/${item.strDateKey.split("-")[1]}`] = NOTE_WORK_TYPE[item.timeLineStatus];
      });
      dataItem["Abnormal Cases"] = item.noteLeaveAnnual;
      dataItem["Annual Leave"] = item.noteLeaveAnnual;
      dataItem["Unpaid Leave"] = item.noteLeaveUnpaid;
      dataItem["notes"] = item.notes;
      return dataItem;
    });
    return result;
  };

  const getDaysInMonth = (dayFrom, monthFrom, yearFrom, dayTo, monthTo, yearTo) => {
    const dateFrom = new Date(yearFrom, monthFrom - 1, dayFrom);
    const dateTo = new Date(yearTo, monthTo - 1, dayTo);
    let days: DateType[] = [];
    let indx = 0;
    let itemsweekend: Number[] = [];
    while (dateFrom <= dateTo) {
      const dataIndex = `${Number(new Date(dateFrom).getDate()).toString().padStart(2, "0")}${Number(new Date(dateFrom).getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      indx++;
      const day: any = {
        dateStr: `${new Date(dateFrom).getDate().toString()}/${(new Date(dateFrom).getMonth() + 1).toString()}`,
        date: dataIndex,
        day: new Date(dateFrom).getDay(),
        idx: indx,
        align: "center"
      };
      days.push(day);
      dateFrom.setDate(dateFrom.getDate() + 1);

      if (day.day === 0 || day.day === 6) {
        itemsweekend.push(day.day);
      }
    }
    return days;
  };

  const handleConvertDayToObjectColumn = (item, index) => {
    return {
      title: () => {
        let text = DAY_OF_WEEK[item.day];
        let backgroundColor = "";
        if (item.day === 0 || item.day === 6) {
          backgroundColor = "#696969FF";
        }

        return (
          <div key={index} style={{ display: "flex", flexDirection: "column", backgroundColor: backgroundColor }}>
            <span>{item.dateStr}</span>
            <div>{text}</div>
          </div>
        );
      },
      dataIndex: `workday${item.date}`,
      key: item.idx,
      width: 100,
      align: "center",
      render: (text, row) => {
        const workingType = row[`workday${item.date}`] ? row[`workday${item.date}`].timeLineStatus : "";
        let textLabel = NOTE_WORK_TYPE[workingType];
        let color = row[`workday${item.date}`] ? row[`workday${item.date}`].color : "";
        return {
          props: {
            style: { background: color, color: "#000000" }
          },
          children: (
            <div>
              <Tooltip title="Edit note" color={"gold"} key={"element"}>
                <span
                  onClick={() => {
                    handleOpenDialogCreateNote(text);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {textLabel}
                </span>
              </Tooltip>
            </div>
          )
        };
      }
    };
  };

  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const formStyle = {
    maxWidth: "none",
    borderRadius: token.borderRadiusLG
  };

  const handleOpenDialogCreateNote = async (text: string, row) => {
    try {
      const timeSheetId = text.timeSheetId ? text.timeSheetId : "";
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
      setIsShowDialogCreateNote(true);
    } catch (e) {
      openNotificationWithIcon("error", { message: "Error", description: "Please try again." });
    }
  };
  const handleCreateNote = async (textNote) => {
    try {
      setLoading(true);
      await createNote(textNote);
      openNotificationWithIcon("success", { message: "Edit note success fully", description: "" });
      hanldeCloseDialogCreateNote();
    } catch (error) {
      openNotificationWithIcon("error", { message: "Error", description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleReloadSearch = () => {
    form.resetFields();
  };

  const onFinishFormSearch = (formData) => {
    const startTime = formData.timePickerSearch[0].format("YYYY-MM-DD");
    const endTime = formData.timePickerSearch[1].format("YYYY-MM-DD");
    if (startTime && endTime) {
      const startDay = Number(startTime.split("-")[2]);
      const endDay = Number(endTime.split("-")[2]);
      const startMounth = Number(startTime.split("-")[1]);
      const endMonth = Number(endTime.split("-")[1]);
      const startYear = Number(startTime.split("-")[0]);
      const endYear = Number(endTime.split("-")[0]);
      const listMounth = getDaysInMonth(startDay, startMounth, startYear, endDay, endMonth, endYear);
      const listDayToColumn = listMounth.map((item, index) => handleConvertDayToObjectColumn(item, index));
      setColumns([...initColumns, ...listDayToColumn, ...initAdvancdeColumns]);
    }
    const param = {
      projectId: formData.projectId,
      startDate: startTime,
      endDate: endTime,
      employeeName: formData.employeeName ? formData.employeeName : "",
      page: page,
      pageSize: DEFAULT_PAGE.SIZE
    };
    setParamToSearch(param);
  };
  // filer state day
  const [typeDay, setTypeDay] = useState("TOTAL");

  const changeTypeDay = (value) => {
    setTypeDay(value);
  };

  const handleExportExcel = async () => {
    const { data } = await getListTimeLineForExcelExport(paramToSearch as PageType);
    exportExcel(convertDataToExportExcel(data.listEmployee), "Timeline Report");
  };
  // @ts-ignore
  return (
    <div id="time-line-page" className="page-layout-default ">
      {contextHolder}
      <Form
        className="ant-card search-form"
        form={form}
        name="advanced_search"
        style={formStyle}
        onFinish={onFinishFormSearch}
        initialValues={{ timePickerSearch: [currentDate[0], currentDate[1]] }}
      >
        <Row gutter={24}>
          <Col span={5}>
            <Form.Item label={`Time`} name="timePickerSearch" rules={[{ required: true, message: " Please choose date range!" }]}>
              <RangePicker
                format={"YYYY-MM-DD"}
                allowClear={true}
                placeholder={["Start Date", "End Date"]}
                disabledDate={disableDateSelectAfterToday}
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label={`Project`} name="projectId" rules={[{ required: false, message: " Please choose project!" }]}>
              <Select
                className="select-project-label"
                showSearch
                size={"middle"}
                style={{ width: "250px" }}
                placeholder="Choose Project"
                defaultActiveFirstOption={true}
                showArrow={true}
                filterOption={false}
                onSearch={onSearchProjectByName}
                allowClear={true}
                options={projectList.map((item) => {
                  return {
                    label: item.name,
                    value: item.id
                  };
                })}
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label={`Employee`} name="employeeName" style={{ paddingLeft: 15 }}>
              <Input showCount maxLength={200} allowClear={true} style={{ width: "250px" }} placeholder="Input Employee Name" />
            </Form.Item>
          </Col>
          <Col span={9} style={{ textAlign: "right" }}>
            <Tooltip title="Search" color={"primary"} key={"Search"}>
              <Button
                loading={loading}
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                size={"middle"}
                style={{ margin: "0 8px", width: "150px" }}
              >
                Search
              </Button>
            </Tooltip>
            <Tooltip title="Reset" color={"primary"} key={"onReset"}>
              <Button
                onClick={handleReloadSearch}
                type="default"
                icon={<ReloadOutlined />}
                size={"middle"}
                style={{ margin: "0 8px", width: "120px" }}
              >
                Reset
              </Button>
            </Tooltip>
          </Col>
        </Row>
        <Row></Row>
      </Form>

      <div className="ant-card ant-card-table" style={{ marginTop: "16px" }}>
        {contextHolder}
        <div className={TimesheetCSS.timeSheetAction}>
          <div>
            <Space style={{ marginBottom: 16 }}>
              <div id="drawer-page-note">
                <Space direction="vertical">
                  <Segmented
                    onChange={changeTypeDay}
                    options={[
                      {
                        label: <div className="TOTAL">TOTAL</div>,
                        value: "TOTAL"
                      },
                      {
                        label: <div className="AL">AL</div>,
                        value: "AL"
                      },
                      {
                        label: <div className="OT">OT</div>,
                        value: "OT"
                      },
                      {
                        label: <div className="ALH">ALH</div>,
                        value: "ALH"
                      },
                      {
                        label: <div className="BOT">BOT</div>,
                        value: "BOT"
                      }
                    ]}
                  />
                </Space>
              </div>
            </Space>
          </div>

          <Space style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "end" }}>
              <Button icon={<CloudDownloadOutlined />} type="primary" onClick={() => handleExportExcel()}>
                Export Excel
              </Button>
            </div>
          </Space>
        </div>

        <div id="table-timeline">
          <Table
            bordered={true}
            loading={loading}
            style={{ paddingTop: "13px" }}
            columns={columns}
            dataSource={dataList}
            scroll={{ x: 1300, y: 440 }}
            pagination={tableParams}
          />
        </div>
      </div>
      <DialogCreateNote
        showDialogCreate={isShowDialogCreateNote}
        handleOk={handleCreateNote}
        handleCancel={hanldeCloseDialogCreateNote}
        stateDay={stateDay}
      />
    </div>
  );
};

export default Timeline;
