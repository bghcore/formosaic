"use client";

import React, { useEffect, useState, useRef, useMemo, type ReactNode } from "react";

interface FormRendererProps {
  config: Record<string, unknown> | null;
  adapter: string;
  configName: string;
  onAdapterError: (message: string) => void;
}

interface AdapterResult {
  createRegistry: () => Record<string, unknown>;
  WrapperProvider?: React.ComponentType<{ children: ReactNode }>;
}

interface CoreModules {
  Formosaic: React.ComponentType<Record<string, unknown>>;
  RulesEngineProvider: React.ComponentType<{ children: ReactNode }>;
  InjectedFieldProvider: React.ComponentType<{ children: ReactNode; injectedFields: Record<string, unknown> }>;
}

async function loadAdapter(name: string): Promise<AdapterResult> {
  switch (name) {
    case "headless": {
      const m = await import("@formosaic/headless");
      return { createRegistry: m.createHeadlessFieldRegistry };
    }
    case "fluent": {
      const m = await import("@formosaic/fluent");
      const fluentUI = await import("@fluentui/react-components");
      const FluentWrapper = ({ children }: { children: ReactNode }) => (
        <fluentUI.FluentProvider theme={fluentUI.webLightTheme}>
          {children}
        </fluentUI.FluentProvider>
      );
      return { createRegistry: m.createFluentFieldRegistry, WrapperProvider: FluentWrapper };
    }
    case "mui": {
      const m = await import("@formosaic/mui");
      const muiStyles = await import("@mui/material/styles");
      const theme = muiStyles.createTheme({ palette: { mode: "light" } });
      const MuiWrapper = ({ children }: { children: ReactNode }) => (
        <muiStyles.ThemeProvider theme={theme}>{children}</muiStyles.ThemeProvider>
      );
      return { createRegistry: m.createMuiFieldRegistry, WrapperProvider: MuiWrapper };
    }
    case "antd": {
      const m = await import("@formosaic/antd");
      return { createRegistry: m.createAntdFieldRegistry };
    }
    case "mantine": {
      const m = await import("@formosaic/mantine");
      const mantineCore = await import("@mantine/core");
      // @ts-expect-error -- CSS import has no type declarations
      await import("@mantine/core/styles.css");
      const MantineWrapper = ({ children }: { children: ReactNode }) => (
        <mantineCore.MantineProvider forceColorScheme="light">
          {children}
        </mantineCore.MantineProvider>
      );
      return { createRegistry: m.createMantineFieldRegistry, WrapperProvider: MantineWrapper };
    }
    case "chakra": {
      const m = await import("@formosaic/chakra");
      const chakraUI = await import("@chakra-ui/react");
      const ChakraWrapper = ({ children }: { children: ReactNode }) => (
        <chakraUI.ChakraProvider value={chakraUI.defaultSystem}>
          {children}
        </chakraUI.ChakraProvider>
      );
      return { createRegistry: m.createChakraFieldRegistry, WrapperProvider: ChakraWrapper };
    }
    case "radix": {
      const m = await import("@formosaic/radix");
      return { createRegistry: m.createRadixFieldRegistry };
    }
    case "react-aria": {
      const m = await import("@formosaic/react-aria");
      return { createRegistry: m.createReactAriaFieldRegistry };
    }
    case "base-web": {
      const m = await import("@formosaic/base-web");
      return { createRegistry: m.createBaseWebFieldRegistry };
    }
    case "heroui": {
      const m = await import("@formosaic/heroui");
      return { createRegistry: m.createHeroUIFieldRegistry };
    }
    case "atlaskit": {
      const m = await import("@formosaic/atlaskit");
      return { createRegistry: m.createAtlaskitFieldRegistry };
    }
    default: {
      const m = await import("@formosaic/headless");
      return { createRegistry: m.createHeadlessFieldRegistry };
    }
  }
}

export default function FormRenderer({ config, adapter, configName, onAdapterError }: FormRendererProps) {
  const [adapterResult, setAdapterResult] = useState<AdapterResult | null>(null);
  const [coreModules, setCoreModules] = useState<CoreModules | null>(null);
  const [loading, setLoading] = useState(true);
  const currentAdapter = useRef(adapter);

  // Load core modules once
  useEffect(() => {
    import("@formosaic/core").then((m) => {
      setCoreModules({
        Formosaic: m.Formosaic as unknown as React.ComponentType<Record<string, unknown>>,
        RulesEngineProvider: m.RulesEngineProvider as unknown as React.ComponentType<{ children: ReactNode }>,
        InjectedFieldProvider: m.InjectedFieldProvider as unknown as React.ComponentType<{ children: ReactNode; injectedFields: Record<string, unknown> }>,
      });
    });
  }, []);

  // Load adapter
  useEffect(() => {
    currentAdapter.current = adapter;
    setLoading(true);
    loadAdapter(adapter)
      .then((result) => {
        if (currentAdapter.current === adapter) {
          setAdapterResult(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(`Failed to load adapter "${adapter}":`, err);
        onAdapterError(`Failed to load ${adapter} adapter. Falling back to Headless.`);
        import("@formosaic/headless").then((m) => {
          if (currentAdapter.current === adapter) {
            setAdapterResult({ createRegistry: m.createHeadlessFieldRegistry });
            setLoading(false);
          }
        });
      });
  }, [adapter, onAdapterError]);

  // Build the registry once per adapter change
  const registry = useMemo(() => {
    if (!adapterResult) return null;
    return adapterResult.createRegistry();
  }, [adapterResult]);

  if (loading || !adapterResult || !coreModules || !registry || !config) {
    return <div style={{ padding: 16, color: "#666" }}>Loading adapter...</div>;
  }

  const { Formosaic, RulesEngineProvider, InjectedFieldProvider } = coreModules;
  const Wrapper = adapterResult.WrapperProvider ?? React.Fragment;

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 16 }}>
      <Wrapper>
        <RulesEngineProvider>
          <InjectedFieldProvider injectedFields={registry}>
            <Formosaic
              key={configName}
              configName={configName}
              formConfig={config}
              defaultValues={{}}
              isManualSave={true}
              isCreate={true}
              saveData={async (data: unknown) => {
                console.log("Playground form data:", data);
                return data;
              }}
            />
          </InjectedFieldProvider>
        </RulesEngineProvider>
      </Wrapper>
    </div>
  );
}
