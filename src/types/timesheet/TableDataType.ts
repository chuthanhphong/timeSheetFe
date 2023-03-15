interface TableDataType {
  key: React.Key;
  projectName: string;
  recordNo: number;
  fullName: string;
  knoxID: string;
  filteredTime: string;
  wfhDateList: Array<string>;
  otDateList: Array<string>;
  compensatoryLeaveList: Array<string>;
  abnormalLeaveList: Array<string>;
  dayOffList: Array<string>;
  note: string;
}

export default TableDataType;
