/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/admin/user",
        destination: "/admin/users",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
