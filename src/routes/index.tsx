import React from "react";
import loadable from "@loadable/component";
import AppLayout from "../components/layout/AppLayout";
import { Navigate } from "react-router-dom";
import Timesheet from "../pages/timesheet";

// - List of all pages
const Home = () => <Navigate to="/dashboard" replace />;
const NotFound = loadable(() => import("../pages/error/not-found"));
const TimeSheet = loadable(() => import("../pages/timesheet"));
const Timeline = loadable(() => import("../pages/timeline"));
const Dashboard = loadable(() => import("../pages/dashboard"));
const Rule = loadable(() => import("../pages/rule"));
const Project = loadable(() => import("../pages/project"));
const Employee = loadable(() => import("../pages/employee"));

const routes = [
  {
    index: true,
    path: "/dashboard",
    name: "Dashboard",
    element: <Dashboard />
  },
  {
    path: "/timeline",
    name: "Timeline",
    element: <Timeline />
  },
  {
    path: "/timesheet",
    name: "TimeSheet",
    element: <TimeSheet />
  },
  {
    path: "/project",
    name: "Project",
    element: <Project />
  },
  {
    path: "/employee",
    name: "Employee",
    element: <Employee />
  },
  {
    path: "/timesheet",
    name: "Timesheet",
    element: <Timesheet />
  },
  {
    index: true,
    path: "/timeline",
    name: "timeline",
    element: <Timeline />
  },
  {
    path: "/rule",
    name: "rule",
    element: <Rule />
  },
  {
    path: "*",
    element: <NotFound />
  }
];

export const AllPages = () => {
  return [
    {
      element: <AppLayout />,
      children: [...routes]
    },
    {
      path: "/",
      element: <Home />
    }
  ];
};
