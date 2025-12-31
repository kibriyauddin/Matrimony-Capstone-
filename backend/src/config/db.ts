import path from "path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

// 🔒 Load env RIGHT HERE (no dependency on index.ts)
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

// Optional hard check (fails fast, prevents silent bugs)
if (!process.env.DB_USER) {
  throw new Error("DB_USER is not defined. Check .env file.");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
