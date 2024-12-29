/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:r23zBJlOxTCD@ep-jolly-surf-a5l7217v.us-east-2.aws.neon.tech/neondb?sslmode=require',
    }
  };