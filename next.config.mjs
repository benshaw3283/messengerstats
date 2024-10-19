/** @type {import('next').NextConfig} */
import MillionLint from "@million/lint";
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
        port: "3001",
      },
    ],
  },
};

export default MillionLint.next({ rsc: true })(nextConfig);
