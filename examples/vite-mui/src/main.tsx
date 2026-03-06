import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { RulesEngineProvider, InjectedFieldProvider } from "@form-eng/core";
import App from "./App";

const theme = createTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RulesEngineProvider>
        <InjectedFieldProvider>
          <App />
        </InjectedFieldProvider>
      </RulesEngineProvider>
    </ThemeProvider>
  </React.StrictMode>
);
