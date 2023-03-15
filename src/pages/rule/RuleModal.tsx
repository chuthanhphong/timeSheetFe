import "./style.css";

import { Form, Input, InputNumber, Modal, Select, TimePicker } from "antd";
import React, { useEffect, useState } from "react";

import { DATE_TIME_CONSTANT } from "@/utils/date";
import dayjs from "dayjs";

interface RuleDataType {
  id: React.Key;
  name: string;
  workingTimeIn: string;
  workingTimeOut: string;
  ruleType: string;
  lateLimit: number;
  minuteLimit: number;
  totalMinuteLimit: number;
  description: string;
}

const RuleModal: React.FC = ({ isModalOpen, setIsModalOpen, handleSubmit, dataEdit, mode }) => {
  const [form] = Form.useForm();
  const [valueInput, setValueInput] = useState(dataEdit as RuleDataType);

  useEffect(() => {
    let dataEditValues = {
      ...dataEdit,
      workingTimeIn: dayjs(dataEdit.workingTimeIn, DATE_TIME_CONSTANT.TIME_FORMAT),
      workingTimeOut: dayjs(dataEdit.workingTimeOut, DATE_TIME_CONSTANT.TIME_FORMAT)
    };
    const mdRulesBlockResponse = dataEdit.mdRulesBlockResponse;
    if (mdRulesBlockResponse) {
      dataEditValues = {
        ...dataEditValues,
        startMinute: mdRulesBlockResponse.startMinute,
        blockMinute: mdRulesBlockResponse.blockMinute,
        calcMinute: mdRulesBlockResponse.calcMinute
      };
    }
    form.setFieldsValue(dataEditValues);
  }, [JSON.stringify(dataEdit)]);

  const onFinish = (formValue) => {
    let submitValue = {
      ...formValue,
      workingTimeIn: formValue.workingTimeIn.format(DATE_TIME_CONSTANT.OFFSET_TIME_FORMAT),
      workingTimeOut: formValue.workingTimeOut.format(DATE_TIME_CONSTANT.OFFSET_TIME_FORMAT)
    };
    if (submitValue.startMinute && submitValue.blockMinute && submitValue.calcMinute) {
      submitValue = {
        ...submitValue,
        mdRulesBlockRequest: {
          startMinute: submitValue.startMinute,
          blockMinute: submitValue.blockMinute,
          calcMinute: submitValue.calcMinute
        }
      };
    }
    handleSubmit(submitValue, mode);
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        title="Rule information"
        open={isModalOpen}
        onOk={form.submit}
        onCancel={() => {
          setIsModalOpen(false);
        }}
      >
        <Form
          form={form}
          name="basic"
          initialValues={valueInput}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600, position: "relative" }}
          onFinish={onFinish}
        >
          <Form.Item name="id" hidden />
          <Form.Item label="Rule Name" name="name" rules={[{ required: true, message: "Please input rule name!" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Time In" name="workingTimeIn" rules={[{ required: true, message: "Please input working time in!" }]}>
            <TimePicker format={DATE_TIME_CONSTANT.TIME_FORMAT} />
          </Form.Item>
          <Form.Item label="Time Out" name="workingTimeOut" rules={[{ required: true, message: "Please input working time out!" }]}>
            <TimePicker format={DATE_TIME_CONSTANT.TIME_FORMAT} />
          </Form.Item>
          <Form.Item label="Rule Type" name="ruleType" rules={[{ required: true, message: "Please select rule type!" }]}>
            <Select
              options={[
                { value: 0, label: "Total Minute" },
                { value: 1, label: "Minute" },
                { value: 2, label: "Block" }
              ]}
            ></Select>
          </Form.Item>
          <Form.Item name="blockId" hidden />
          <Form.Item noStyle shouldUpdate={(prevValues, currValues) => prevValues.ruleType !== currValues.ruleType}>
            {({ getFieldValue }) =>
              getFieldValue("ruleType") === 2 ? (
                <>
                  <Form.Item name="startMinute" label="Start Minute" rules={[{ required: true, message: "Please input start minute!" }]}>
                    <InputNumber />
                  </Form.Item>
                  <Form.Item name="blockMinute" label="Block Minute" rules={[{ required: true, message: "Please select rule type!" }]}>
                    <InputNumber />
                  </Form.Item>
                  <Form.Item name="calcMinute" label="Calc Minute" rules={[{ required: true, message: "Please select rule type!" }]}>
                    <InputNumber />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
          <Form.Item label="Late Limit" name="lateLimit">
            <InputNumber />
          </Form.Item>
          <Form.Item label="Minutes Limit" name="minuteLimit">
            <InputNumber />
          </Form.Item>
          <Form.Item label="Total Minutes Limit" name="totalMinuteLimit">
            <InputNumber />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RuleModal;
