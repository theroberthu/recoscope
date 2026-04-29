import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/tracker/evergreen/:slug",
        destination: "/tracker/:slug",
        permanent: true,
      },
      {
        source: "/tracker/seasonal/:slug",
        destination: "/tracker/:slug",
        permanent: true,
      },
      {
        source: "/tracker/evergreen/:slug/:period",
        destination: "/tracker/:slug?period=:period",
        permanent: true,
      },
      {
        source: "/tracker/seasonal/:slug/:period",
        destination: "/tracker/:slug?period=:period",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
