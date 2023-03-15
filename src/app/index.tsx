import "./index.css";

import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import React from "react";
import ReactDOM from "react-dom/client";
import store from "../redux/store";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <React.StrictMode>
      <ConfigProvider
        theme={{
          token: {
            // colorPrimary: '#00b96b',
          }
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </React.StrictMode>
  </Provider>
);
