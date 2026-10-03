// attendanceData.ts

export type AttendanceStatus = "present" | "absent" | "leave";

export interface AttendanceSummary {
  currentPercentage: number;
  requiredPercentage: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
}

export interface MonthlyAttendance {
  month: string;
  attendance: number;
}

export interface CalendarAttendance {
  date: number;
  status: AttendanceStatus;
}

export const attendanceSummary: AttendanceSummary = {
  currentPercentage: 92,
  requiredPercentage: 75,
  presentDays: 46,
  absentDays: 4,
  leaveDays: 2,
};

export const monthlyAttendance: MonthlyAttendance[] = [
  {
    month: "Jan",
    attendance: 95,
  },
  {
    month: "Feb",
    attendance: 88,
  },
  {
    month: "Mar",
    attendance: 90,
  },
  {
    month: "Apr",
    attendance: 96,
  },
  {
    month: "May",
    attendance: 91,
  },
  {
    month: "Jun",
    attendance: 92,
  },
];

export const juneAttendance: CalendarAttendance[] = [
  {
    date: 1,
    status: "leave",
  },
  {
    date: 2,
    status: "present",
  },
  {
    date: 3,
    status: "present",
  },
  {
    date: 4,
    status: "present",
  },
  {
    date: 5,
    status: "present",
  },
  {
    date: 6,
    status: "present",
  },
  {
    date: 7,
    status: "present",
  },
  {
    date: 8,
    status: "leave",
  },
  {
    date: 9,
    status: "present",
  },
  {
    date: 10,
    status: "present",
  },
  {
    date: 11,
    status: "present",
  },
  {
    date: 12,
    status: "present",
  },
  {
    date: 13,
    status: "present",
  },
  {
    date: 14,
    status: "present",
  },
  {
    date: 15,
    status: "leave",
  },
  {
    date: 16,
    status: "present",
  },
  {
    date: 17,
    status: "present",
  },
  {
    date: 18,
    status: "absent",
  },
  {
    date: 19,
    status: "present",
  },
  {
    date: 20,
    status: "present",
  },
  {
    date: 21,
    status: "present",
  },
  {
    date: 22,
    status: "leave",
  },
  {
    date: 23,
    status: "present",
  },
  {
    date: 24,
    status: "present",
  },
  {
    date: 25,
    status: "absent",
  },
  {
    date: 26,
    status: "present",
  },
  {
    date: 27,
    status: "present",
  },
  {
    date: 28,
    status: "present",
  },
  {
    date: 29,
    status: "leave",
  },
  {
    date: 30,
    status: "present",
  },
];

export const attendanceLegend = [
  {
    label: "Present",
    status: "present",
  },
  {
    label: "Absent",
    status: "absent",
  },
  {
    label: "Leave",
    status: "leave",
  },
];
