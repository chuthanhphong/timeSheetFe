import { Button, Form, Input, Modal, Select, Typography } from "antd";
import React, { useEffect, useState } from "react";

import type { FormInstance } from "antd/es/form";

const { Text, Link } = Typography;

const ModalProject = (props) => {
  const formRef = React.useRef<FormInstance>(null);
  const { isModalOpen, title, showModal, handleSubmit, dataEdit, dataCustomer } = props;
  const { TextArea } = Input;
  useEffect(() => {
    formRef.current?.setFieldsValue(dataEdit);
  }, [dataEdit]);
  const onClose = () => {
    showModal();
    formRef.current?.resetFields();
  };
  const handleSubmitForm = (value) => {
    const newData = value;
    dataEdit?.id ? (newData.id = dataEdit?.id) : newData;
    props.handleSubmit(newData);
    onClose();
  };
  return (
    <Modal title={title} open={isModalOpen} footer={null} onCancel={onClose}>
      <Form labelCol={{ flex: "130px" }} labelAlign="left" colon={false} ref={formRef} onFinish={handleSubmitForm}>
        <Form.Item label="Project Name : " name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Rule : " name="rule" rules={[{ required: true }]}>
          <Select options={dataCustomer} />
        </Form.Item>
        <Form.Item label="Description : " name="description">
          <TextArea />
        </Form.Item>
        <Form.Item label=" ">
          <Button type="primary" htmlType="submit" style={{ float: "right", marginRight: "20px" }}>
            Submit
          </Button>
          <Button
            style={{ float: "right", marginRight: "5px" }}
            onClick={() => {
              onClose();
            }}
          >
            Clear
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalProject;
