import { Button, Input, Modal, Popconfirm, Table, notification } from "antd";
import { CloudUploadOutlined, DeleteOutlined, InboxOutlined, PaperClipOutlined, SearchOutlined } from "@ant-design/icons";
import { DeleteFilled, EditFilled, PlusOutlined, SyncOutlined } from "@ant-design/icons/lib/icons";
import React, { useEffect, useRef, useState } from "react";
import { addEmployeeManager, deleteEmployeeManager, editEmployeeManager, findEmployeeByName } from "@/apis/serveEmployee";
import { read, utils } from "xlsx";

import type { ColumnsType } from "antd/es/table";
import EmployeeFilterRequest from "@/types/employee/EmployeeFilterRequest";
import EmployeeInsertRequest from "../../types/employee/EmployeeInsertRequest";
import ModalEmployee from "@/components/formEmployee";
import TimesheetCSS from "../../components/timesheet/Timesheet.module.css";
import { debounce } from "@antv/util";
import { getAllRules } from "@/apis/ruleApi";
import { multipleInsertFromExelData } from "../../apis/serveEmployee";
import { searchProject } from "@/apis/serveProject";

interface DataType {
  id: number;
  name: string;
  Ldap: string;
  Du: string;
  projectName: string;
  knox_id: string;
  project_id: string;
  email: string;
}
type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationContent {
  message: string;
  description: string;
}
const Project: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState({});
  const [dataEdit, setDataEdit] = useState({});
  const [title, setTitle] = useState("");
  const [dataSearch, setDataSearch] = useState("");
  const [listProject, setListProject] = useState([]);
  const [rules, setRules] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [uploadFile, setUploadFile] = useState();
  const employeeInsertList = useRef<Array<EmployeeInsertRequest>>([]);
  const defualtEmployeeFilterRequest: EmployeeFilterRequest = {
    name: "",
    page: page,
    size: 10
  };
  const columns: ColumnsType<DataType> = [
    {
      title: "Full Name",
      dataIndex: "name",
      width: "20%"
    },
    {
      title: "Ldap",
      dataIndex: "ldap",
      filterSearch: true,
      width: "10%"
    },
    {
      title: "Knox id",
      dataIndex: "knoxId",
      filterSearch: true,
      width: "10%"
    },
    {
      title: "Email",
      dataIndex: "email",
      filterSearch: true,
      width: "15%"
    },
    {
      title: "Project Name",
      dataIndex: "project",
      filterSearch: true,
      width: "15%",
      ellipsis: true,
      render: (project) => {
        return project.name;
      }
    },
    {
      title: "Du",
      dataIndex: "du",
      width: "5%"
    },
    {
      title: "Action",
      render: (_, record: { id: Number }) => (
        // @ts-ignore
        <div>
          &nbsp;
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleForEmployee(record.id)} okButtonProps={{ loading: false }}>
            <Button id="buttonCustom" style={{ color: "rgb(244 67 53)" }}>
              <DeleteFilled /> DELETE
            </Button>
          </Popconfirm>
          &nbsp; &nbsp; &nbsp;
          <Button id="buttonCustom" onClick={() => showModalEditEmployee(1, record)}>
            <EditFilled /> EDIT
          </Button>
        </div>
      ),
      width: "20%",
      align: `center`
    }
  ];

  useEffect(() => {
    getAllRules().then((res) => {
      const newData = res?.data?.map((item) => {
        return { value: item.name, id: item.id };
      });
      setRules(newData);
    });
    getDataProject();
  }, []);

  useEffect(() => {
    getDataEmployee(false);
  }, [page]);
  const getDataEmployee = async (check) => {
    const params = { ...defualtEmployeeFilterRequest };
    params.name = check ? dataSearch : "";
    try {
      const res = await findEmployeeByName(params);
      setData(res.data);
    } catch {}
  };
  const getNameProject = (id) => {
    const newDataProject: any = listProject.filter((item: any) => item.id === id);
    return newDataProject[0]?.value;
  };
  const getDataProject = () => {
    const params = { ...defualtEmployeeFilterRequest };
    params.name = "";
    searchProject(params).then((res) => {
      const newData = res.data.map((item) => {
        return { value: item.name, id: item.id };
      });
      setListProject(newData);
    });
  };
  const showModalEditEmployee = (status: number, record: any) => {
    let dataEdit = {};
    if (status === 0) {
      setTitle("Add Employee");
    }
    if (status === 1) {
      dataEdit = { ...record };
      setTitle("Edit Employee");
    }
    setIsModalOpen(!isModalOpen);
    setDataEdit(dataEdit);
  };

  const handleDeleForEmployee = async (id: number | Number) => {
    try {
      await deleteEmployeeManager(id);
      getDataEmployee(false);
    } catch (error) {}
  };
  // EDIT ADD EMPOOYEE
  const handleSubmit = async (dataEmployee: { id: Number }) => {
    if (!dataEmployee.id) {
      try {
        await addEmployeeManager(dataEmployee);
        getDataEmployee(false);
      } catch (error) {}
    } else if (dataEmployee.id) {
      try {
        await editEmployeeManager(dataEmployee);
        getDataEmployee(false);
      } catch (error) {}
    }
  };

  const submitSearchEmployee = debounce(() => {
    setPage(0);
    getDataEmployee(true);
  }, 1000);
  // eslint-disable-next-line require-await
  const onChangeSearchEmployee = async (e) => {
    setDataSearch(e.target.value);
  };
  const handleReset = () => {
    setDataSearch("");
    getDataEmployee(false);
  };
  const openNotificationWithIcon = (type: NotificationType, content: NotificationContent) => {
    api[type]({
      message: content.message,
      description: content.description
    });
  };

  const showModalExcelImport = () => {
    setShowExcelImportModal(true);
  };

  const handleExcelImportModalOk = (e: React.MouseEvent<HTMLElement>) => {
    if (!employeeInsertList.current.length) {
      openNotificationWithIcon("warning", { message: "Please upload an excel file!", description: "" });
      return;
    }
    setLoading(true);
    multipleInsertFromExelData(employeeInsertList.current)
      .then((res: any) => {
        openNotificationWithIcon("success", { message: res.data, description: "" });
        handleRemoveFile();
        employeeInsertList.current = [];
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
          const employeeInserts = rows.map((item: any) => {
            const formItem: EmployeeInsertRequest = {
              id: Number(item["ID"]),
              name: item["Name"],
              ldap: item["Ldap"] || "",
              du: item["Du"],
              projectName: item["Project Name"],
              knoxId: item["KnoxID"] || "",
              email: item["Email"] || ""
            };
            return formItem;
          });
          employeeInsertList.current = employeeInserts;
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  const handleRemoveFile = () => {
    setUploadFile(null);
  };
  return (
    <div className="page-layout-default">
      {contextHolder}
      <div className="ant-card search-form" style={{ paddingBottom: "4rem" }}>
        <div style={{ float: "left", display: "flex", width: "100%" }}>
          <div style={{ width: "40%", fontSize: "16px" }}>
            <b>Search by name : </b>
            &nbsp;
            <Input placeholder="Search by name ... " value={dataSearch} onChange={onChangeSearchEmployee} style={{ width: "60%" }} />
          </div>
          &nbsp;
          <div style={{ width: "60%", textAlign: "right" }}>
            <Button
              icon={<SearchOutlined />}
              type="primary"
              onClick={() => submitSearchEmployee()}
              style={{ margin: "0 8px", width: "150px" }}
            >
              SEARCH
            </Button>
            &nbsp;
            <Button icon={<SyncOutlined />} onClick={() => handleReset()} style={{ margin: "0 8px", width: "150px" }}>
              RESET
            </Button>
          </div>
        </div>
      </div>
      <br />
      <div className="ant-card ant-card-table">
        <div style={{ float: "right" }}>
          <Button type="primary" onClick={() => showModalEditEmployee(0, {})} icon={<PlusOutlined />}>
            Add Employee
          </Button>
          &ensp;
          <Button onClick={showModalExcelImport} icon={<CloudUploadOutlined />}>
            Excel Import
          </Button>
        </div>
        <br />
        <br />
        <Table
          scroll={{ y: 440 }}
          columns={columns}
          // @ts-ignore
          dataSource={data.listEmployee}
          pagination={{
            // @ts-ignore
            total: data.total,
            defaultPageSize: 10,
            // @ts-ignore
            showTotal: (total, range) => {
              setPage((range[0] - 1) / 10);
            }
          }}
        />
      </div>
      <ModalEmployee
        isModalOpen={isModalOpen}
        showModal={showModalEditEmployee}
        handleSubmit={handleSubmit}
        dataEdit={dataEdit}
        title={title}
        setDataEdit={setDataEdit}
        dataProject={listProject}
        dataRules={rules}
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
          <Button shape="round" key="back" onClick={handleExcelModalImportCancel}>
            Return
          </Button>,
          <Button key="submit" shape="round" type="primary" loading={loading} onClick={handleExcelImportModalOk}>
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
    </div>
  );
};

export default Project;
