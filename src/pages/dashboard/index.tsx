import { Button, DatePicker, Empty } from "antd";
import React, { useEffect, useState } from "react";
import { disableDateSelectAfterToday, getCurrentMonthRange } from "@/utils/date";

import { Column } from "@ant-design/plots";
import { SearchOutlined } from "@ant-design/icons";
import { SyncOutlined } from "@ant-design/icons/lib/icons";
import dayjs from "dayjs";
import { get } from "lodash";
import { getDataDashboard } from "../../apis";
import style from "./style.module.css";

const defaultDate = getCurrentMonthRange();
const dateFormat = "YYYY-MM-DD";
const Dashboard = () => {
  const { RangePicker } = DatePicker;
  const [valueDatePicker, setValueDatepicker] = useState([dayjs(defaultDate[0], dateFormat), dayjs(defaultDate[1], dateFormat)]);
  const [dataChart, setDataChart] = useState([]);
  const configChart = {
    data: dataChart,
    isGroup: true,
    xField: "projectName",
    yField: "value",
    seriesField: "name",
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: false
      }
    },
    label: {
      position: "middle",
      layout: [
        {
          type: "interval-adjust-position"
        },
        {
          type: "interval-hide-overlap"
        },
        {
          type: "adjust-color"
        }
      ]
    }
  };
  const valueDate = {
    firstDay: dayjs(get(valueDatePicker, "0")).toString(),
    currentDay: dayjs(get(valueDatePicker, "1")).toString()
  };
  //set data of this month
  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    await getDataDashboard(valueDate)
      .then((res) => {
        const newData = res.data.map((item: any) => ({ value: item.missingMinute, projectName: item.projectName, name: "Missing Minute" }));
        setDataChart(newData);
      })
      .finally();
  };
  // get value datePicker
  const handleChangeDate = (moment, string) => {
    setValueDatepicker(string);
  };
  //call api get data chart by value datePicker
  const handleSearch = async () => {
    try {
      const res = await getDataDashboard(valueDate);
      const newData = res.data.map((item: any) => ({ value: item.missingMinute, projectName: item.projectName, name: "Missing Minute" }));
      setDataChart(newData);
    } catch (error) {}
  };
  const handleReset = () => {
    setValueDatepicker([dayjs(defaultDate[0], dateFormat), dayjs(defaultDate[1], dateFormat)]);
    getData();
  };
  return (
    <div className="page-layout-default">
      <div className="ant-card search-form" style={{ paddingBottom: "4rem" }}>
        <div style={{ float: "left", display: "flex", width: "100%" }}>
          <div style={{ width: "40%", fontSize: "16px" }}>
            <b>Search by datepicker : </b>
            &nbsp;
            <RangePicker
              style={{ width: "60%" }}
              disabledDate={disableDateSelectAfterToday}
              defaultValue={[dayjs(defaultDate[0], dateFormat), dayjs(defaultDate[1], dateFormat)]}
              onChange={handleChangeDate}
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            />
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
      <div className="ant-card ant-card-table ">
        {dataChart.length === 0 ? (
          <div style={{ paddingTop: "5rem", paddingBottom: "3rem" }}>
            <Empty />
          </div>
        ) : (
          <div className={style["chart-project"]}>
            <div>
              <p id={style["lable-dashboard"]}>STATISTICAL REPORT : </p>
              {/* @ts-ignore*/}
              <Column {...configChart} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
