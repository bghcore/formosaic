"use client";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { RulesEngineProvider, InjectedFieldProvider } from "@form-eng/core";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RulesEngineProvider>
            <InjectedFieldProvider>
              {children}
            </InjectedFieldProvider>
          </RulesEngineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
