import dayjs from "dayjs";

export const DATE_TIME_CONSTANT = {
  TIME_FORMAT: "HH:mm",
  OFFSET_TIME_FORMAT: "HH:mmZ",
  TIME_FORMAT_SS: "HH:mm:ss"
};

import type { RangePickerProps } from "antd/es/date-picker";

/**
 * It returns an array of two dayjs objects, the first being the first day of the current month, and
 * the second being the current day.
 * </code>
 *
 *
 * A:
 *
 * You can use <code>dayjs().startOf('month')</code> to get the first day of the current month.
 * <code>dayjs().startOf('month').format('YYYY-MM-DD')
 * </code>
 * @returns An array of two dayjs objects.
 */
export const getCurrentMonthRange = () => {
  let firstDay = dayjs().startOf("month");
  let currentDay = dayjs();
  return [dayjs(firstDay, "YYYY-MM-DD"), dayjs(currentDay, "YYYY-MM-DD")];
};

/**
 * Can not select days after today
 * @param current - The currently selected date.
 * @returns A function that takes a date and returns a boolean.
 */
export const disableDateSelectAfterToday: RangePickerProps["disabledDate"] = (current) => {
  // Can not select days after today
  return current && current > dayjs().endOf("day");
};
