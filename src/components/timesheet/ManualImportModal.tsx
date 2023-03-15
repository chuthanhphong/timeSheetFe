import React, { useCallback, useEffect, useState } from "react";
import { Input, Modal, Form, Button, Select, TimePicker, DatePicker, notification, Row, Col } from "antd";
import type { FormInstance } from "antd/es/form";
import { DATE_TIME_CONSTANT } from "../../utils/date";
import { multipleInsertFromExelData } from "../../apis/timeSheetAPI";
import dayjs from "dayjs";

type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationContent {
  message: string;
  description: string;
}
const ManualImportModal = (props) => {
  const formRef = React.useRef<FormInstance>(null);
  const { showDialogManualImport, handleCancel } = props;
  const [loading, setLoading] = useState(false);

  const onClose = () => {
    handleCancel();
    formRef.current?.resetFields();
  };
  const [api, contextHolder] = notification.useNotification();
  const handleSubmitForm = (value) => {
    const newDataSubmit = {
      workingDate: new Date(value.workingDate),
      fullName: value.fullName,
      userId: value.userId,
      du: value.du,
      project: value.project,
      timeIn: dayjs(value.timeIn).format(DATE_TIME_CONSTANT.TIME_FORMAT_SS),
      timeOut: dayjs(value.timeOut).format(DATE_TIME_CONSTANT.TIME_FORMAT_SS),
      exception: value.exception,
      regularHours: dayjs(value.regularHours).format(DATE_TIME_CONSTANT.TIME_FORMAT_SS),
      overTimeHours: dayjs(value.overTimeHours).format(DATE_TIME_CONSTANT.TIME_FORMAT_SS),
      totalWorkHours: dayjs(value.totalWorkHours).format(DATE_TIME_CONSTANT.TIME_FORMAT_SS),
      knoxId: value.knoxId,
      ldap: value.ldap
    };
    handleManualImport([newDataSubmit]);
  };

  const openNotificationWithIcon = (type: NotificationType, content: NotificationContent) => {
    api[type]({
      message: content.message,
      description: content.description
    });
  };
  const handleManualImport = (timeSheetInsertFormList) => {
    setLoading(true);
    multipleInsertFromExelData(timeSheetInsertFormList)
      .then((res: any) => {
        openNotificationWithIcon("success", { message: res.data, description: "" });
        timeSheetInsertFormList = [];
        onClose();
        setLoading(false);
      })
      .catch((err) => {
        openNotificationWithIcon("error", { message: err.response.data, description: "Please try again." });
        setLoading(false);
      });
  };

  return (
    <div>
      {contextHolder}
      <Modal title={"Manual Import"} open={showDialogManualImport} footer={null} onCancel={onClose} width={1000}>
        <Form
          labelCol={{ flex: "130px" }}
          labelAlign="left"
          colon={false}
          ref={formRef}
          onFinish={handleSubmitForm}
          style={{ paddingTop: "20px" }}
        >
          <Row>
            <Col span={12}>
              <Form.Item label="Date" name="workingDate" rules={[{ required: true, message: "Please input Date !" }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item label="Name" name="fullName" rules={[{ required: true, message: "Please input Name!" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="User ID" name="userId" rules={[{ required: true, message: "Please input User ID!" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Du" name="du" rules={[{ required: true, message: "Please input Du!" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Project" name="project" rules={[{ required: true, message: "Please input Project!" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="In" name="timeIn" rules={[{ required: true, message: "Please input working time in!" }]}>
                <TimePicker defaultValue={dayjs("00:00:00", "HH:mm:ss")} />
              </Form.Item>
              <Form.Item label="Out" name="timeOut" rules={[{ required: true, message: "Please input working time out!" }]}>
                <TimePicker defaultValue={dayjs("00:00:00", "HH:mm:ss")} />
              </Form.Item>
            </Col>
            <Col span={12} style={{ paddingLeft: "30px" }}>
              <Form.Item label="Exception" name="exception">
                <Input />
              </Form.Item>
              <Form.Item label="Regular Hours" name="regularHours" rules={[{ required: true, message: "Please input Regular Hours!" }]}>
                <TimePicker defaultValue={dayjs("00:00:00", "HH:mm:ss")} />
              </Form.Item>
              <Form.Item label="Overtime Hours" name="overTimeHours">
                <TimePicker defaultValue={dayjs("00:00:00", "HH:mm:ss")} />
              </Form.Item>
              <Form.Item
                label="Total Work Hours"
                name="totalWorkHours"
                rules={[{ required: true, message: "Please input Total Work Hours!" }]}
              >
                <TimePicker defaultValue={dayjs("00:00:00", "HH:mm:ss")} />
              </Form.Item>
              <Form.Item label="KnoxID" name="knoxId" rules={[{ required: true, message: "Please input KnoxID!" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Ldap" name="ldap" rules={[{ required: true, message: "Please input Ldap!" }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label=" " style={{ textAlign: "right" }}>
            <Button type="primary" htmlType="submit" shape="round" loading={loading}>
              Submit
            </Button>
            &nbsp;
            <Button
              onClick={() => {
                onClose();
              }}
              shape="round"
            >
              Close
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManualImportModal;
