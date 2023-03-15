import React from "react";
import { Select } from "antd";

interface propsType {
  stateDay: string;
}

const SelectTimeDayOption: React.FC = (props: propsType) => {
  const { stateDay } = props;

  const onChange = () => {};
  const onSearch = (value: string) => {};
  return (
    <>
      <Select
        showSearch
        placeholder="Select"
        optionFilterProp="children"
        onChange={onChange}
        onSearch={onSearch}
        value={stateDay}
        filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
        options={[
          {
            value: "AL",
            label: `AL`
          },
          {
            value: "ALH",
            label: "ALH"
          },
          {
            value: "BOT",
            label: "BOT"
          },
          {
            value: "OT",
            label: "OT"
          }
        ]}
      />
    </>
  );
};

export default SelectTimeDayOption;
