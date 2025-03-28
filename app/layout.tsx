import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConfigProvider, theme } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stockico",
  description: "sopra-fs25-template-client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: "var(--button-text)", // Use your CSS variable
              borderRadius: 38, // Default corner rounding
              colorText: "var(--foreground)",
              colorBgContainer: "var(--background)",
              fontSize: 16,
            },
            components: {
              Button: {
                colorPrimary: "var(--button-text)",
                controlHeight: 38, // Button height
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
          <AntdRegistry>{children}</AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}
