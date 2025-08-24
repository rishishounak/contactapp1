import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(process.env.SUPABASE_DB_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
});
