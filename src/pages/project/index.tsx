import { Button, Input, Modal, Popconfirm, Table } from "antd";
import { CloudDownloadOutlined, PlusOutlined, SyncOutlined } from "@ant-design/icons/lib/icons";
import {
  CloudUploadOutlined,
  DeleteFilled,
  DeleteOutlined,
  EditFilled,
  InboxOutlined,
  PaperClipOutlined,
  SearchOutlined
} from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";
import {
  addProjectManager,
  deleteProjectManager,
  editProjectManager,
  multipleInsertFromExcelDataProject,
  searchProject
} from "@/apis/serveProject";
import { read, utils } from "xlsx";

import type { ColumnsType } from "antd/es/table";
import ModalProject from "@/components/formProject";
import ProjectFilterRequest from "@/types/project/ProjectFilterRequest";
import TimesheetCSS from "@/components/timesheet/Timesheet.module.css";
import { debounce } from "@antv/util";
import { exportExcel } from "@/components/exportExcel";
import { getAllProject } from "@/apis/serveProject";
import { getAllRules } from "@/apis/ruleApi";

interface DataType {
  id: number;
  name: string;
  timeLate: number;
  nameCustomer: string;
  description: string;
  key: String;
}

const Project: React.FC = () => {
  const timeSheetInsertFormList = useRef([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [dataEdit, setDataEdit] = useState();
  const [title, setTitle] = useState("");
  const [rules, setRules] = useState([]);
  const [dataSearch, setDataSearch] = useState();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState();
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(0);
  const defaultProjectFilterRequest: ProjectFilterRequest = {
    name: "",
    page: page,
    size: 10
  };
  useEffect(() => {
    getAllRules().then((res) => {
      const newData = res?.data?.map((item) => {
        return { value: item.name, id: item.id };
      });
      setRules(newData);
    });
  }, []);
  useEffect(() => {
    getData();
  }, [page]);
  const getData = () => {
    const params = { ...defaultProjectFilterRequest };
    params.name = "";
    searchProject(params).then((res) => {
      const newData = res?.data?.data?.map((item) => {
        return { ...item, rule: item.ruleName, timeLate: item.missingMinute };
      });

      setData(newData);
      setTotalPage(res.data.total);
    });
  };
  const columns: ColumnsType<DataType> = [
    {
      title: "Project",
      dataIndex: "name",
      width: "30%"
    },
    {
      title: "Rule",
      dataIndex: "rule",
      filterSearch: true,
      width: "15%"
    },
    {
      title: "Description",
      dataIndex: "description",
      width: "20%"
    },
    {
      title: "Time late",
      dataIndex: "timeLate",
      width: "10%"
    },
    {
      title: "Action",
      render: (_, record: { id: Number }) => (
        <div>
          &nbsp;
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id)} okButtonProps={{ loading: false }}>
            <Button id="buttonCustom" style={{ color: "rgb(244 67 53)" }}>
              <DeleteFilled /> DELETE
            </Button>
          </Popconfirm>
          &nbsp; &nbsp; &nbsp;
          <Button id="buttonCustom" onClick={() => showProjectModal(1, record)}>
            <EditFilled /> EDIT
          </Button>
        </div>
      ),
      width: "15%",
      align: "center"
    }
  ];

  const showProjectModal = (status: number, record: any) => {
    if (status === 0) {
      setTitle("Add Project");
    }
    if (status === 1) {
      setDataEdit({ ...record, rule: record?.rule });
      setTitle("Edit Project");
    }
    setIsProjectModalOpen(!isProjectModalOpen);
  };
  const handleShowUploadModal = () => {
    setUploadFile();
    setIsUploadModalOpen(!isUploadModalOpen);
  };
  const handleDelete = async (id: number | Number) => {
    try {
      await deleteProjectManager(id);
      getData();
    } finally {
    }
  };
  const getRuleId = (name: String) => {
    const idRule: any = rules.filter((item: { value: String }) => item.value == name);
    return Number(idRule[0].id);
  };
  const handleSubmit = async (value: { id: number; name: string; rule: string; description: string }) => {
    if (value.id) {
      try {
        const newValue = {
          id: value.id,
          name: value.name,
          description: value.description,
          ruleId: getRuleId(value.rule)
        };
        await editProjectManager(newValue);
        const newData = data.map((item: any) => {
          if (item.id == value.id) {
            return { ...item, name: value.name, rule: value.rule, description: value.description };
          }
          return item;
        });
        setData(newData);
      } finally {
        const newData = data.map((item: any) => {
          if (item.id == value.id) {
            return { ...item, name: value.name, rule: value.rule, description: value.description };
          }
          return item;
        });
        setData(newData);
      }
    } else {
      const newValue = {
        name: value.name,
        description: value.description,
        ruleId: getRuleId(value.rule)
      };
      try {
        await addProjectManager(newValue);
        getData();
      } finally {
      }
    }
  };

  const handleSearch = debounce(() => {
    const params = { ...defaultProjectFilterRequest };
    params.name = dataSearch;
    fetchProject(params);
  }, 1000);
  const fetchProject = (params) => {
    searchProject(params)
      .then((response: any) => {
        const newData = response.data.data.map((item) => {
          return { ...item, rule: item.ruleName, timeLate: item.missingMinute };
        });
        setTotalPage(response.data.total);
        setData(newData);
      })
      .catch((err: any) => {});
  };
  const handleChange = (e) => {
    setDataSearch(e.target.value);
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
          const timesheetFormList = rows.map((item: any) => {
            return { name: item.name };
          });
          //@ts-ignore
          timeSheetInsertFormList.current = timesheetFormList;
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  const handleInsertFormExcelProject = async () => {
    try {
      await multipleInsertFromExcelDataProject(timeSheetInsertFormList.current);
    } finally {
      handleShowUploadModal();
      getData();
    }
  };
  const handleReset = () => {
    getData();
    setDataSearch("");
  };

  // const dispatch = useDispatch();
  // const dataUser = useSelector(userSelector);
  // const handleTest = () => {
  //   dispatch(
  //     userSlice.actions.login({
  //       name: "admin",
  //       roleCode: "1",
  //       accessToken: "123456"
  //     })
  //   );

  // };

  const handleExportExcel = () => {
    getAllProject().then((res) => {
      const newDataExcel = res?.data?.map((item) => {
        return { name: item.name, timeLate: item.missingMinute === null ? 0 : item.missingMinute };
      });
      exportExcel(newDataExcel, "project");
    });
  };
  return (
    <div className="page-layout-default">
      <div className="ant-card search-form " style={{ paddingBottom: "4rem" }}>
        <div style={{ float: "left", display: "flex", width: "100%" }}>
          <div style={{ width: "40%", fontSize: "16px" }}>
            <b>Search by name : </b>
            &nbsp;
            <Input placeholder="Search by project name ... " value={dataSearch} onChange={handleChange} style={{ width: "60%" }} />
          </div>
          &nbsp;
          <div style={{ width: "60%", textAlign: "right" }}>
            <Button icon={<SearchOutlined />} type="primary" onClick={() => handleSearch()} style={{ margin: "0 8px", width: "150px" }}>
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
          <Button onClick={() => showProjectModal(0, {})} icon={<PlusOutlined />}>
            Add Project
          </Button>
          &ensp;
          <Button icon={<CloudDownloadOutlined />} type="primary" onClick={() => handleExportExcel()}>
            Export Excel
          </Button>
          &ensp;
          <Button icon={<CloudUploadOutlined />} onClick={handleShowUploadModal}>
            UpLoad Excel
          </Button>
        </div>
        <br />
        <br />
        <Table
          scroll={{ y: 440 }}
          columns={columns}
          dataSource={data}
          pagination={{
            // @ts-ignore
            total: totalPage,
            defaultPageSize: 10,
            // @ts-ignore
            showTotal: (total, range) => {
              setPage((range[0] - 1) / 10);
            }
          }}
        />
      </div>

      <ModalProject
        isModalOpen={isProjectModalOpen}
        showModal={showProjectModal}
        handleSubmit={handleSubmit}
        dataEdit={dataEdit}
        title={title}
        dataCustomer={rules}
        setDataEdit={setDataEdit}
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
        open={isUploadModalOpen}
        onOk={handleShowUploadModal}
        onCancel={handleShowUploadModal}
        footer={[
          <Button shape="round" key="back" onClick={handleShowUploadModal}>
            Return
          </Button>,
          <Button
            key="submit"
            shape="round"
            type="primary"
            // loading={loading} onClick={}
            onClick={handleInsertFormExcelProject}
          >
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
              <DeleteOutlined style={{ fontSize: "16px", cursor: "pointer", paddingLeft: "5px" }} onClick={() => setUploadFile()} />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Project;
