import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import App from "./App.jsx";
import { theme } from "./theme";
import AuthProvider from "./context/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider theme={{ ...theme, colorScheme: "dark" }} defaultColorScheme="dark">
      <DatesProvider settings={{ locale: "sr", firstDayOfWeek: 1 }}>
        <Notifications position="top-right" />
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </DatesProvider>
    </MantineProvider>
  </React.StrictMode>
);