import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "./assets/styles.scss";

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
