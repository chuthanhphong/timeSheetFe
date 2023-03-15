interface TimeSheetFilterRequest {
  fromDate: string;
  toDate: string;
  projectIds: Array<Number>;
  account: string;
  pageNumber: number;
  pageSize: number;
}

export default TimeSheetFilterRequest;
