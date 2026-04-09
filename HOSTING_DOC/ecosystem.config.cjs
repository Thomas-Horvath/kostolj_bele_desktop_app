module.exports = {
  apps: [
    {
      name: "kostolj-bele",
      cwd: "/var/www/kostolj-bele",
      script: "server.js",
      env: {
        AUTH_TRUST_HOST: "true",
        NODE_ENV: "production",
        PORT: "9005",
        DATABASE_URL: "file:./prisma/dev.db",
        NEXTAUTH_SECRET: "valami_titok_jelszó9876524"
      },
    },
  ],
};
