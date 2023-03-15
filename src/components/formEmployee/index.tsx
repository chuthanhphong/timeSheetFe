import React, { useCallback, useEffect, useState } from "react";
import { Input, Modal, Form, Button, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import ProjectFilterRequest from "types/project/ProjectFilterRequest";
import { DEFAULT_PAGE } from "@/utils/constants";
import { findProjectByNameLike } from "@/apis/serveProject";
import { getAllRules } from "@/apis/ruleApi";
import { debounce } from "lodash";
const defaultProjectFilterRequest: ProjectFilterRequest = {
  name: "",
  page: DEFAULT_PAGE.INDEX,
  size: DEFAULT_PAGE.SIZE
};
const ModalProject = (props) => {
  const formRef = React.useRef<FormInstance>(null);
  const { isModalOpen, title, showModal, dataEdit, dataProject, dataRules } = props;
  const [rule, setRule] = useState();
  const [listProject, setListProject] = useState([]);
  const { TextArea } = Input;
  useEffect(() => {
    formRef.current?.setFieldsValue(dataEdit);
  }, [JSON.stringify(dataEdit)]);
  useEffect(() => {
    fetchProject();
  }, []);
  const fetchProject = useCallback((params = { ...defaultProjectFilterRequest }) => {
    findProjectByNameLike(params)
      .then((response: any) => {
        setListProject(response.data);
      })
      .catch((err: any) => {});
  }, []);
  const onClose = () => {
    showModal();
    formRef.current?.resetFields();
  };
  const getIdRule = (name) => {
    const newRule = dataRules.filter((item) => item.value === name);
    return newRule[0]?.id;
  };

  const handleSubmitForm = (value) => {
    // const indexRule = dataRules.findIndex((item) => item.value === rule);
    // const indexProject = dataProject.findIndex((item) => item.value === project);
    // const newData = { ...value, projectId: dataProject[indexProject].id, ruleId: dataRules[indexRule].id };
    // dataEdit?.id ? (newData.id = dataEdit?.id) : newData;
    const newDataSubmit = {
      ruleId: getIdRule(value.ruleId),
      description: value.description,
      du: value.email,
      email: value.email,
      fullName: value.fullName,
      id: value.id,
      knoxId: value.knoxId,
      ldap: value.ldap,
      projectId: value.projectId,
      name: value.name
    };
    props.handleSubmit(newDataSubmit);
    onClose();
  };
  const onSearchProjectByName = debounce((newValue: string) => {
    if (newValue) {
      const params = { ...defaultProjectFilterRequest };
      params.name = newValue;
      fetchProject(params);
    } else {
    }
  }, 1000);
  return (
    <Modal title={title} open={isModalOpen} footer={null} onCancel={onClose}>
      <Form labelCol={{ flex: "130px" }} labelAlign="left" colon={false} ref={formRef} onFinish={handleSubmitForm}>
        <Form.Item label="ID" name="id" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Name " name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Full Name " name="fullName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="LDAP " name="ldap" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Knox id " name="knoxId" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email " name="email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="DU " name="du" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Project " name="projectId" rules={[{ required: true }]}>
          <Select
            showSearch
            placeholder="Project Name"
            // style={props.style}
            defaultActiveFirstOption={true}
            showArrow={true}
            filterOption={false}
            onSearch={onSearchProjectByName}
            notFoundContent={null}
            options={(listProject || []).map((project) => ({
              value: project.id,
              label: project.name
            }))}
          />
        </Form.Item>
        <Form.Item label="Rule " name="ruleId" rules={[{ required: true }]}>
          <Select defaultActiveFirstOption={true} options={dataRules} />
        </Form.Item>
        <Form.Item label="Description " name="description">
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
