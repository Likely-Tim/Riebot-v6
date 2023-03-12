/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 10 * 1000,
    pagesBufferLength: 1
  }
};

module.exports = nextConfig;
