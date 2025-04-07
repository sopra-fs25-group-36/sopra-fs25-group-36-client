// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        "antd": require.resolve("antd"),
        "@ant-design/icons": require.resolve("@ant-design/icons"),
        "@tanstack/react-query": require.resolve("@tanstack/react-query")
      }
    }
  },
  transpilePackages: [
    "antd",
    "@ant-design/icons",
    "@ant-design/nextjs-registry",
    "@tanstack/react-query"
  ]
};

export default nextConfig;