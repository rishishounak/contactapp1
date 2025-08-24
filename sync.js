// sync.js
import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";
import { Contact } from "./models/contact.js";

// Initialize Sequelize with Supabase connection
const sequelize = new Sequelize(process.env.SUPABASE_DB_URL, {
  dialect: "postgres",
  logging: console.log, // optional, shows SQL queries
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }, // required for Supabase free tier
  },
});

(async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Connected to Supabase Postgres successfully!");

    // Sync the Contact model (creates table if not exists)
    await Contact.sync({ alter: true }); // alter: true updates table if model changed
    console.log("✅ Contacts table synced successfully!");

    process.exit(0); // exit script
  } catch (err) {
    console.error("❌ DB sync failed:", err);
    process.exit(1);
  }
})();
