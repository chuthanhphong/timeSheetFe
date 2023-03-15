import React from "react";
import { useRoutes } from "react-router-dom";
import { AllPages } from "../routes";
import "@/assets/styles/main.css";
function App() {
  const allPages = useRoutes(AllPages());

  return <>{allPages}</>;
}

export default App;
