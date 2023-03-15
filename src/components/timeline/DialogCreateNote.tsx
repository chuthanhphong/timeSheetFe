import React, { useEffect, useState } from "react";
import { Button, DatePicker, Descriptions, Form, Input, Modal, notification, Select, TimePicker, Upload, UploadProps } from "antd";
import "./DialogCreateNoteStyle.css";
import { PlusOutlined } from "@ant-design/icons";
import { uploadFile, downloadFile } from "@/apis/FileApi.ts";
import { getListWorkType } from "@/apis/timeLineApi";
import { DEFAULT_TIME_VALUE_TIME_LINE, TIME_LINE_PICKER_FORMAT } from "../../utils/constants/TimeLineConstants";

type NotificationType = "success" | "info" | "warning" | "error";

const { RangePicker } = DatePicker;

interface NotificationContent {
  message: string;
  description: string;
}

const DialogCreateNote: React.FC = (props) => {
  const { showDialogCreate, handleCancel, handleOk, stateDay } = props;

  const [form] = Form.useForm();
  const { TextArea } = Input;
  const [workingTypeList, setWorkingTypeList] = useState();
  const [listFileDelete, setListFileDelete] = useState([]);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    handleGetWorkingTypeCode();
  }, [stateDay.workingType]);

  useEffect(() => {
    handleResetForm();
    form.setFieldsValue(stateDay);
  }, [JSON.stringify(stateDay)]);
  const handleSubmit = (form) => {
    handleOk(form);
    handleResetForm();
  };

  const handleGetWorkingTypeCode = async () => {
    try {
      const res = await getListWorkType({ type: "working_type" });
      const workingTypeList = res.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        };
      });
      setWorkingTypeList(workingTypeList);
    } catch (error) {}
  };

  const handleResetForm = () => {
    form.resetFields;
  };

  const openNotificationWithIcon = (type: NotificationType, content: NotificationContent) => {
    api[type]({
      message: content.message,
      description: content.description
    });
  };

  const handleUpload = async (file) => {
    try {
      const res = await uploadFile(file);
      openNotificationWithIcon("success", { message: "Upload file sucess", description: "uploaded" });
    } catch (err) {
      openNotificationWithIcon("error", { message: "", description: "File uploaded failed" });
    } finally {
    }
  };

  const checkNullTimeOt = (time) => {
    return time?.format(TIME_LINE_PICKER_FORMAT) !== DEFAULT_TIME_VALUE_TIME_LINE.OT_FROM;
  };
  const onFinishForm = (fieldsValue: any) => {
    const values = {
      ...fieldsValue,
      timeInOut: fieldsValue["timeInOut"],
      workingType: fieldsValue["workingType"],
      otTime: fieldsValue["otTime"],
      overTimeHours: fieldsValue["overTimeHours"],
      missingMinutes: fieldsValue["missingMinutes"],
      lateComingMinutes: fieldsValue["lateComingMinutes"],
      earlyLeavingMinutes: fieldsValue["earlyLeavingMinutes"],
      notes: fieldsValue["notes"],
      attachments: fieldsValue["attachments"]
    };
    let listEvidence = [];
    if (values.attachments) {
      values.attachments.filter((item) => {
        listEvidence.push(item.name);
      });
    }
    const formData = {
      id: stateDay.timeSheetId,
      employeeId: stateDay.employeeId,
      projectId: stateDay.projectId,
      workingDate: stateDay.workingDate,
      workingType: values.workingType,
      createdAt: stateDay.createdAt,
      otFrom: checkNullTimeOt(values.otTime[0]) ? values.otTime[0].format(TIME_LINE_PICKER_FORMAT) : null,
      otTo: checkNullTimeOt(values.otTime[1]) ? values.otTime[1].format(TIME_LINE_PICKER_FORMAT) : null,
      notes: values.notes,
      attachments: listEvidence.length > 0 ? listEvidence : null,
      timeIn: values.timeInOut[0].format(TIME_LINE_PICKER_FORMAT),
      timeOut: values.timeInOut[1].format(TIME_LINE_PICKER_FORMAT),
      lateComingMinutes: values.lateComingMinutes,
      earlyLeavingMinutes: values.earlyLeavingMinutes,
      overTimeHours: checkNullTimeOt(values.overTimeHours[1]) ? values.overTimeHours.format(TIME_LINE_PICKER_FORMAT) : null,
      missingMinutes: stateDay.missingMinutes,
      regularHours: stateDay.regularHours,
      listFileNameDelete: listFileDelete
    };
    handleSubmit(formData);
  };

  const handleRemoveFileEvidence = (file) => {
    const listFileDelelte = [];
    if (file) {
      listFileDelelte.push(file.name);
    }
    setListFileDelete(listFileDelelte);
  };

  const onFinishFailedForm = (errorInfo: any) => {};

  const getFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e.fileList;
  };

  return (
    <>
      {contextHolder}
      <Modal
        onCancel={handleCancel}
        footer={null}
        width={800}
        open={showDialogCreate}
        style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}
        title={`Working day : ${stateDay.strWorkingDate} `}
      >
        <header className={"header-dialog"}>
          <Descriptions layout={"horizontal"}>
            <Descriptions.Item label="Employee name">{stateDay.employeeName}</Descriptions.Item>
            <Descriptions.Item label="Delivery Unit">{stateDay.du}</Descriptions.Item>
            <Descriptions.Item label="LDAP">{stateDay.ldap}</Descriptions.Item>
            <Descriptions.Item label="Email">{stateDay.email}</Descriptions.Item>
            <Descriptions.Item label="Project ">{stateDay.project}</Descriptions.Item>
          </Descriptions>
        </header>
        <Form
          form={form}
          initialValues={stateDay}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 25 }}
          style={{ marginBottom: 30, paddingTop: 20 }}
          autoComplete="off"
          onFinish={onFinishForm}
          onFinishFailed={onFinishFailedForm}
        >
          <div style={{ maxHeight: "calc(40vh - 3px)", overflowY: "auto" }}>
            <Form.Item label="Check in" name="timeInOut" labelAlign={"left"} rules={[{ required: true, message: "Time In is required" }]}>
              <TimePicker.RangePicker
                format={TIME_LINE_PICKER_FORMAT}
                placeholder={["Time In", "Time Out"]}
                allowClear={true}
                style={{ width: 380 }}
                className={"time-picker-ot"}
              />
            </Form.Item>
            <Form.Item label="Type" name="workingType" labelAlign={"left"} rules={[{ required: true, message: "WorkingType is required" }]}>
              <Select size={"middle"} allowClear={true} placeholder={"Working Type"} style={{ width: 380 }} options={workingTypeList} />
            </Form.Item>
            <Form.Item labelAlign={"left"} label="Overtime Range" name="otTime">
              <TimePicker.RangePicker
                format={TIME_LINE_PICKER_FORMAT}
                placeholder={["Start Time", "End Time"]}
                allowClear={true}
                style={{ width: 380 }}
                className={"time-picker-ot"}
              />
            </Form.Item>
            <Form.Item labelAlign={"left"} label="Overtime Hours" name="overTimeHours">
              <TimePicker style={{ width: 380 }} format={TIME_LINE_PICKER_FORMAT} />
            </Form.Item>
            <Form.Item labelAlign={"left"} label="Missing Minutes" name="missingMinutes">
              <Input style={{ width: 380 }} placeholder="Missing Minute" />
            </Form.Item>
            <Form.Item labelAlign={"left"} label="Late Coming Minutes" name="lateComingMinutes">
              <Input style={{ width: 380 }} placeholder="Late Coming Minutes" />
            </Form.Item>
            <Form.Item labelAlign={"left"} label="Early leaving minutes" name="earlyLeavingMinutes">
              <Input style={{ width: 380 }} placeholder="Early leaving minutes" />
            </Form.Item>
            <Form.Item labelAlign={"left"} label="Notes" name="notes" rules={[{ required: true, message: "Note is required" }]}>
              <TextArea style={{ width: 380 }} rows={4} placeholder="Input note" maxLength={500} />
            </Form.Item>

            <Form.Item valuePropName="fileList" labelAlign={"left"} label="Attachments" name="attachments" getValueFromEvent={getFile}>
              <Upload
                accept={".jpg, .png, .jpeg"}
                listType="picture-card"
                maxCount={5}
                multiple
                onRemove={handleRemoveFileEvidence}
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    handleUpload(file);
                  };
                  reader.readAsText(file);

                  // Prevent upload
                  return false;
                }}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </div>
          <Form.Item style={{ paddingTop: 40 }} wrapperCol={{ offset: 15, span: 16 }}>
            <Button onClick={handleCancel} type="default" htmlType="button">
              Cancel
            </Button>
            <Button style={{ marginLeft: 10 }} type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DialogCreateNote;
