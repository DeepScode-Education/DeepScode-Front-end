// // useAttendance.ts

// import { useMemo } from "react";

// import {
//   attendanceSummary,
//   monthlyAttendance,
//   juneAttendance,
//   attendanceLegend,
// } from "./attendanceData";

// const useAttendance = () => {
//   const attendancePercentage = useMemo(() => {
//     return attendanceSummary.currentPercentage;
//   }, []);

//   const aboveMinimum = useMemo(() => {
//     return (
//       attendanceSummary.currentPercentage - attendanceSummary.requiredPercentage
//     );
//   }, []);

//   const getAttendanceStatus = (date: number) => {
//     const day = juneAttendance.find((item) => item.date === date);

//     return day?.status || "present";
//   };

//   const getStatusClass = (status: string) => {
//     switch (status) {
//       case "present":
//         return "present";

//       case "absent":
//         return "absent";

//       case "leave":
//         return "leave";

//       default:
//         return "present";
//     }
//   };

//   const refreshAttendance = () => {
//     console.log("Attendance Data", {
//       summary: attendanceSummary,

//       monthly: monthlyAttendance,

//       calendar: juneAttendance,
//     });
//   };

//   return {
//     attendanceSummary,

//     monthlyAttendance,

//     juneAttendance,

//     attendanceLegend,

//     attendancePercentage,

//     aboveMinimum,

//     getAttendanceStatus,

//     getStatusClass,

//     refreshAttendance,
//   };
// };

// export default useAttendance;





// useAttendance.ts

import { useState, useEffect, useCallback } from "react";
import { studentAttendanceApi, StudentAttendanceData } from "@/integrations/client";

const FALLBACK: StudentAttendanceData = {
  summary: {
    currentPercentage: 0,
    requiredPercentage: 75,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
  },
  monthlyTrend: [],
  calendar: [],
  calendarMonthLabel: "",
  calendarYear: new Date().getFullYear(),
  legend: [
    { label: "Present", status: "present" },
    { label: "Absent", status: "absent" },
    { label: "On Leave", status: "leave" },
  ],
};

const useAttendance = () => {
  const [data, setData] = useState<StudentAttendanceData>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async (month?: number, year?: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentAttendanceApi.getMine(month, year);
      if (res.success) setData(res.data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Couldn't load attendance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // status is null when that day was never marked — callers should treat
  // null as "no data", not as present.
  const getAttendanceStatus = (date: number) => {
    const day = data.calendar.find((item) => item.date === date);
    return day?.status ?? null;
  };

  return {
    attendanceSummary: data.summary,
    monthlyAttendance: data.monthlyTrend,
    calendarDays: data.calendar,
    calendarMonthLabel: data.calendarMonthLabel,
    calendarYear: data.calendarYear,
    attendanceLegend: data.legend,
    getAttendanceStatus,
    loading,
    error,
    refreshAttendance: fetchAttendance,
  };
};

export default useAttendance;