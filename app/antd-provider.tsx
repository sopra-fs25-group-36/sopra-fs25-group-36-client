"use client";

import { ConfigProvider, theme, App } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";

export function AntDesignProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "var(--button-text)",
            borderRadius: 38,
            colorText: "var(--foreground)",
            colorBgContainer: "var(--background)",
            fontSize: 14,
          },
          components: {
            Button: {
              colorPrimary: "var(--button-text)",
              controlHeight: 38,
            },
            Input: {
              colorBorder: "var(--card-border)",
              colorTextPlaceholder: "var(--foreground)",
              colorBgContainer: "var(--card-background)",
            },
            DatePicker: {
              colorBgContainer: "var(--card-background)",
              colorBorder: "var(--card-border)",
              colorText: "var(--foreground)",
            },
            Form: {
              labelColor: "var(--foreground)",
            },
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
