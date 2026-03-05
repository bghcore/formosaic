import React, { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Container,
  Box,
} from "@mui/material";
import { LoginMfaExample } from "./login-mfa/LoginMfaExample";
import { CheckoutExample } from "./checkout/CheckoutExample";
import { DataEntryExample } from "./data-entry/DataEntryExample";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
  },
});

type ExampleKey = "login-mfa" | "checkout" | "data-entry";

const examples: Record<ExampleKey, { label: string; component: React.FC }> = {
  "login-mfa": { label: "Login + MFA", component: LoginMfaExample },
  checkout: { label: "E-Commerce Checkout", component: CheckoutExample },
  "data-entry": { label: "Data Entry", component: DataEntryExample },
};

export const App: React.FC = () => {
  const [active, setActive] = useState<ExampleKey>("login-mfa");
  const ActiveComponent = examples[active].component;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ mr: 4 }}>
            Dynamic Forms Examples
          </Typography>
          <ToggleButtonGroup
            value={active}
            exclusive
            onChange={(_, val) => val && setActive(val)}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                color: "rgba(255,255,255,0.7)",
                borderColor: "rgba(255,255,255,0.3)",
                "&.Mui-selected": {
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,0.15)",
                },
              },
            }}
          >
            {(Object.keys(examples) as ExampleKey[]).map((key) => (
              <ToggleButton key={key} value={key}>
                {examples[key].label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box>
          <ActiveComponent />
        </Box>
      </Container>
    </ThemeProvider>
  );
};
