// import StudentLayout from "../components/StudentLayout";

// import useAttendance from "../components/attendance/useAttendance";

// import { CalendarCheck, UserCheck, UserX, Plane } from "lucide-react";

// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
// } from "recharts";

// const Attendance = () => {
//   const {
//     attendanceSummary,
//     monthlyAttendance,
//     getAttendanceStatus,
//     attendanceLegend,
//   } = useAttendance();

//   const stats = [
//     {
//       title: "Current %",
//       value: `${attendanceSummary.currentPercentage}%`,
//       sub: `${attendanceSummary.currentPercentage - attendanceSummary.requiredPercentage}% above min`,
//       icon: CalendarCheck,
//       color: "text-emerald-600",
//     },
//     {
//       title: "Present days",
//       value: attendanceSummary.presentDays,
//       icon: UserCheck,
//       color: "text-gray-900",
//     },
//     {
//       title: "Absent days",
//       value: attendanceSummary.absentDays,
//       icon: UserX,
//       color: "text-red-500",
//     },
//     {
//       title: "Leave days",
//       value: attendanceSummary.leaveDays,
//       icon: Plane,
//       color: "text-orange-500",
//     },
//   ];

//   return (
//     <StudentLayout
//       title="Attendance"
//       subtitle={`Current ${attendanceSummary.currentPercentage}% · Required ${attendanceSummary.requiredPercentage}%`}
//     >
//       {/* Stats */}

//       <div
//         className="
//       grid
//       grid-cols-1
//       gap-4
//       sm:grid-cols-2
//       xl:grid-cols-4
//       "
//       >
//         {stats.map((item) => {
//           const Icon = item.icon;

//           return (
//             <div
//               key={item.title}
//               className="
//               rounded-xl
//               border
//               bg-white
//               p-5
//               "
//             >
//               <div className="flex justify-between">
//                 <p className="text-xs text-gray-500">{item.title}</p>

//                 <Icon size={16} className="text-gray-400" />
//               </div>

//               <h2
//                 className={`
//                 mt-3
//                 text-3xl
//                 font-bold
//                 ${item.color}
//                 `}
//               >
//                 {item.value}
//               </h2>

//               {item.sub && (
//                 <p className="mt-1 text-xs text-gray-500">{item.sub}</p>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Main */}

//       <div
//         className="
//       mt-6
//       grid
//       grid-cols-1
//       gap-5
//       xl:grid-cols-3
//       "
//       >
//         {/* Graph */}

//         <div
//           className="
//         rounded-xl
//         border
//         bg-white
//         p-5
//         xl:col-span-2
//         "
//         >
//           <div className="mb-5">
//             <h3 className="text-base font-semibold">Monthly attendance</h3>

//             <p className="text-xs text-gray-500">Last 6 months</p>
//           </div>

//           <div className="h-[300px] w-full">
//             <ResponsiveContainer>
//               <AreaChart data={monthlyAttendance}>
//                 <defs>
//                   <linearGradient
//                     id="attendanceGradient"
//                     x1="0"
//                     y1="0"
//                     x2="0"
//                     y2="1"
//                   >
//                     <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />

//                     <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>

//                 <XAxis dataKey="month" fontSize={12} />

//                 <YAxis domain={[50, 100]} fontSize={12} />

//                 <Tooltip />

//                 <Area
//                   type="monotone"

//                   dataKey="attendance"

//                   stroke="#2563eb"

//                   fill="url(#attendanceGradient)"

//                   strokeWidth={2}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Calendar */}

//         <div
//           className="
//         rounded-xl
//         border
//         bg-white
//         p-5
//         "
//         >
//           <h3 className="text-base font-semibold">June calendar</h3>

//           <p className="text-xs text-gray-500">Daily attendance</p>

//           <div
//             className="
//           mt-5
//           grid
//           grid-cols-7
//           gap-2
//           "
//           >
//             {Array.from({ length: 30 }, (_, i) => i + 1).map((date) => {
//               const status = getAttendanceStatus(date);

//               return (
//                 <div
//                   key={date}
//                   className={`
//                   flex
//                   h-9
//                   items-center
//                   justify-center
//                   rounded-lg
//                   text-xs
//                   font-medium

//                   ${
//                     status === "present"
//                       ? "bg-emerald-100 text-emerald-700"
//                       : status === "absent"
//                         ? "bg-red-100 text-red-600"
//                         : "bg-orange-100 text-orange-600"
//                   }

//                   `}
//                 >
//                   {date}
//                 </div>
//               );
//             })}
//           </div>

//           {/* Legend */}

//           <div
//             className="
//           mt-6
//           flex
//           flex-wrap
//           gap-4
//           "
//           >
//             {attendanceLegend.map((item) => (
//               <div key={item.label} className="flex items-center gap-2 text-xs">
//                 <span
//                   className={`
//                   h-2
//                   w-2
//                   rounded-full

//                   ${
//                     item.status === "present"
//                       ? "bg-emerald-500"
//                       : item.status === "absent"
//                         ? "bg-red-500"
//                         : "bg-orange-500"
//                   }
//                   `}
//                 />

//                 {item.label}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </StudentLayout>
//   );
// };

// export default Attendance;








import StudentLayout from "../components/StudentLayout";

import useAttendance from "../components/attendance/useAttendance";

import { CalendarCheck, UserCheck, UserX, Plane } from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const Attendance = () => {
  const {
    attendanceSummary,
    monthlyAttendance,
    calendarDays,
    calendarMonthLabel,
    calendarYear,
    getAttendanceStatus,
    attendanceLegend,
    loading,
    error,
  } = useAttendance();

  const stats = [
    {
      title: "Current %",
      value: `${attendanceSummary.currentPercentage}%`,
      sub: `${attendanceSummary.currentPercentage - attendanceSummary.requiredPercentage}% ${
        attendanceSummary.currentPercentage >= attendanceSummary.requiredPercentage ? "above" : "below"
      } min`,
      icon: CalendarCheck,
      color:
        attendanceSummary.currentPercentage >= attendanceSummary.requiredPercentage
          ? "text-emerald-600"
          : "text-red-500",
    },
    {
      title: "Present days",
      value: attendanceSummary.presentDays,
      icon: UserCheck,
      color: "text-gray-900",
    },
    {
      title: "Absent days",
      value: attendanceSummary.absentDays,
      icon: UserX,
      color: "text-red-500",
    },
    {
      title: "Leave days",
      value: attendanceSummary.leaveDays,
      icon: Plane,
      color: "text-orange-500",
    },
  ];

  return (
    <StudentLayout
      title="Attendance"
      subtitle={`Current ${attendanceSummary.currentPercentage}% · Required ${attendanceSummary.requiredPercentage}%`}
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}

      <div
        className="
      grid
      grid-cols-1
      gap-4
      sm:grid-cols-2
      xl:grid-cols-4
      "
      >
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
              rounded-xl
              border
              bg-white
              p-5
              "
            >
              <div className="flex justify-between">
                <p className="text-xs text-gray-500">{item.title}</p>

                <Icon size={16} className="text-gray-400" />
              </div>

              <h2
                className={`
                mt-3
                text-3xl
                font-bold
                ${item.color}
                `}
              >
                {loading ? "—" : item.value}
              </h2>

              {item.sub && !loading && (
                <p className="mt-1 text-xs text-gray-500">{item.sub}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Main */}

      <div
        className="
      mt-6
      grid
      grid-cols-1
      gap-5
      xl:grid-cols-3
      "
      >
        {/* Graph */}

        <div
          className="
        rounded-xl
        border
        bg-white
        p-5
        xl:col-span-2
        "
        >
          <div className="mb-5">
            <h3 className="text-base font-semibold">Monthly attendance</h3>

            <p className="text-xs text-gray-500">Last 6 months</p>
          </div>

          <div className="h-[300px] w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Loading…
              </div>
            ) : monthlyAttendance.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                No attendance data yet.
              </div>
            ) : (
              <ResponsiveContainer>
                <AreaChart data={monthlyAttendance}>
                  <defs>
                    <linearGradient
                      id="attendanceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />

                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="month" fontSize={12} />

                  <YAxis domain={[0, 100]} fontSize={12} />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="#2563eb"
                    fill="url(#attendanceGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Calendar */}

        <div
          className="
        rounded-xl
        border
        bg-white
        p-5
        "
        >
          <h3 className="text-base font-semibold">
            {calendarMonthLabel ? `${calendarMonthLabel} ${calendarYear} calendar` : "Calendar"}
          </h3>

          <p className="text-xs text-gray-500">Daily attendance</p>

          <div
            className="
          mt-5
          grid
          grid-cols-7
          gap-2
          "
          >
            {calendarDays.map(({ date }) => {
              const status = getAttendanceStatus(date);

              return (
                <div
                  key={date}
                  className={`
                  flex
                  h-9
                  items-center
                  justify-center
                  rounded-lg
                  text-xs
                  font-medium

                  ${
                    status === "present"
                      ? "bg-emerald-100 text-emerald-700"
                      : status === "absent"
                        ? "bg-red-100 text-red-600"
                        : status === "leave"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-50 text-gray-400"
                  }

                  `}
                >
                  {date}
                </div>
              );
            })}
          </div>

          {/* Legend */}

          <div
            className="
          mt-6
          flex
          flex-wrap
          gap-4
          "
          >
            {attendanceLegend.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <span
                  className={`
                  h-2
                  w-2
                  rounded-full

                  ${
                    item.status === "present"
                      ? "bg-emerald-500"
                      : item.status === "absent"
                        ? "bg-red-500"
                        : "bg-orange-500"
                  }
                  `}
                />

                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Attendance;
