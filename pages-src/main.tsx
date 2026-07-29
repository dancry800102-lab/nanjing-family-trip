import React from "react";
import { createRoot } from "react-dom/client";
import TripApp from "../app/trip-app";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TripApp />
  </React.StrictMode>,
);
