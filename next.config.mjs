/** @type {import('next').NextConfig} */
const nextConfig = {
  // A standalone output praktikus self-hostingnál, például DigitalOcean dropleten,
  // mert egy karcsúbb, futtatásra kész szervercsomagot ad a build végén.
  output: "standalone",
};

export default nextConfig;
