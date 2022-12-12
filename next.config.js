/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  publicRuntimeConfig: {
    SERVER_BASEURL: process.env.SERVER_BASEURL,
  },
};

module.exports = nextConfig;
