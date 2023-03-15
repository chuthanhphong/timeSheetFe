import React from "react";
import { List } from "antd";
import "../../pages/timeline/TimeLineStyle.module.css";
import TimelineCss from "../../pages/timeline/TimeLineStyle.module.css";

const TableComonCode: React.FC = (props) => {
  const { listNote } = props;
  const renderListNote = () => {
    return (
      <List
        size="large"
        key={(item) => item.notation}
        bordered={false}
        dataSource={listNote}
        renderItem={(item) => (
          <List.Item className={TimelineCss["label-page-note"]}>
            <span>{item.notation}</span>
            <span>{item.definition}</span>
          </List.Item>
        )}
      />
    );
  };
  return <div>{renderListNote()}</div>;
};

export default TableComonCode;
