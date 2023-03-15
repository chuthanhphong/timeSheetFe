import { Button, Col, Form, Input, Popconfirm, Row, Table } from "antd";
import { ClearOutlined, DeleteFilled, EditFilled, PlusOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons/lib/icons";
import React, { useEffect, useState } from "react";
import { createRule, deleteRuleById, getAllRules, updateRuleById } from "../../apis/ruleApi";

import RuleModal from "./RuleModal";
import dayjs from "dayjs";

const UPDATE = "update";
const CREATE = "create";
const RULETYPE = {
  0: "Total Minute",
  1: "Minute",
  2: "Block"
};

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

const Rule = () => {
  const columns = [
    {
      title: "Rule Name",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Time In",
      dataIndex: "workingTimeIn",
      key: "workingTimeIn"
    },
    {
      title: "Time Out",
      dataIndex: "workingTimeOut",
      key: "workingTimeOut"
    },
    {
      title: "Rule Type",
      dataIndex: "ruleType",
      key: "ruleType",
      render: (text) => RULETYPE[text]
    },
    {
      title: "Late Limit",
      dataIndex: "lateLimit",
      key: "lateLimit"
    },
    {
      title: "Minutes Limit",
      dataIndex: "minuteLimit",
      key: "minuteLimit"
    },
    {
      title: "Total Minutes Limit",
      dataIndex: "totalMinuteLimit",
      key: "totalMinuteLimit"
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Action",
      key: "action",
      render: (_, record: RuleDataType) => {
        return (
          <div>
            &nbsp;
            <Popconfirm title="Sure to delete?" onConfirm={() => onDeleteRule(record.id)} okButtonProps={{ loading: false }}>
              <Button id="buttonCustom" style={{ color: "rgb(244 67 53)" }}>
                <DeleteFilled /> DELETE
              </Button>
            </Popconfirm>
            &nbsp; &nbsp; &nbsp;
            <Button id="buttonCustom" onClick={() => onEditRule(record.id)}>
              <EditFilled /> EDIT
            </Button>
          </div>
        );
      },
      width: "15%",
      align: `center`
    }
  ];
  const dataEditInit = {
    id: "",
    name: "",
    workingTimeIn: "08:00",
    workingTimeOut: "17:00",
    ruleType: "",
    lateLimit: "",
    minuteLimit: "",
    totalMinuteLimit: "",
    description: ""
  };

  const [dataSource, setDataSource] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataEdit, setDataEdit] = useState(dataEditInit);
  const [mode, setMode] = useState("");
  const [dataSearch, setDataSearch] = useState("");
  useEffect(() => {
    onSearch();
  }, []);

  const handleSubmit = async (value: RuleDataType, mode: string) => {
    const id = value.id as number;
    if (mode === CREATE) {
      await createRule(value);
      setDataEdit({});
    } else if (mode === UPDATE) {
      await updateRuleById(id, value);
      setDataEdit({});
    } else {
      return;
    }
    onSearch();
  };

  const onSearch = () => {
    getAllRules().then((rules) => {
      const data = rules.data.map((row: RuleDataType) => {
        row.workingTimeIn = dayjs(row.workingTimeIn.toString(), "HH:mmZ").format("HH:mm");
        row.workingTimeOut = dayjs(row.workingTimeOut.toString(), "HH:mmZ").format("HH:mm");
        return row;
      });
      setDataSource(data);
    });
  };

  const onAddRule = () => {
    setDataEdit(dataEditInit);
    setMode(CREATE);
    setIsModalOpen(true);
  };

  const onEditRule = (key: React.Key) => {
    let i = dataSource.findIndex((item: RuleDataType) => item.id === key);
    setDataEdit(dataSource[i]);
    setMode(UPDATE);
    setIsModalOpen(true);
  };

  const onDeleteRule = async (key: React.Key) => {
    await deleteRuleById(key as number);
    await getAllRules().then((rules) => setDataSource(rules.data));
  };

  const handleChange = (e) => {
    setDataSearch(e.target.value);
  };
  const handleReset = () => {
    setDataSearch("");
  };
  return (
    <div className="page-layout-default">
      <div className="ant-card search-form" style={{ paddingBottom: "4rem" }}>
        <div style={{ float: "left", display: "flex", width: "100%" }}>
          <div style={{ width: "40%", fontSize: "16px" }}>
            <b>Search by name : </b>
            &nbsp;
            <Input placeholder="Search by rule name ... " value={dataSearch} onChange={handleChange} style={{ width: "60%" }} />
          </div>
          &nbsp;
          <div style={{ width: "60%", textAlign: "right" }}>
            <Button icon={<SearchOutlined />} type="primary" onClick={() => onSearch()} style={{ margin: "0 8px", width: "150px" }}>
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
        <Button type="primary" onClick={onAddRule} style={{ float: "right" }} icon={<PlusOutlined />}>
          Add Rule
        </Button>
        <br />
        <br />
        <Table rowKey={"id"} dataSource={dataSource} columns={columns} scroll={{ y: 440 }} />
      </div>
      <RuleModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} handleSubmit={handleSubmit} dataEdit={dataEdit} mode={mode} />
    </div>
  );
};

export default Rule;
