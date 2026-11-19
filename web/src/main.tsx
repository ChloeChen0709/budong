import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./script-font.css";
import "./styles.css";
import { installPressFeedback } from "./lib/press";

installPressFeedback();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
