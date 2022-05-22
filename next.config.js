const isProd = process.env.IS_PROD;
console.log("*********************");
console.log("inside next.config.js");
console.log("isProd: ", isProd);
console.log("*********************");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  assetPrefix: isProd ? `./` : "",
};

module.exports = nextConfig;
