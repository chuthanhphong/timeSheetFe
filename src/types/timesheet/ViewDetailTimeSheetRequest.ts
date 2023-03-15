export default interface ViewDetailTimeSheetRequest {
  employee_id: Number;
  startDate: String;
  endDate: String;
  page: number;
  pageSize: number;
}
