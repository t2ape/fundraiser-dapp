import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

import {BrowserRouter, NavLink} from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
