import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "postgresql://postgres.qpdrpywdgxkrrqwpsogd:acclickrem@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
  {
    dialect: "postgres",
    logging: false,
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to Supabase Postgres!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection failed:", err);
    process.exit(1);
  }
})();
