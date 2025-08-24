import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

export const Contact = sequelize.define(
  "Contact",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    phoneNumber: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    linkedId: { type: DataTypes.INTEGER, allowNull: true },
    linkPrecedence: { type: DataTypes.ENUM("primary","secondary"), defaultValue:"primary" },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "contacts",
    timestamps: true,
  }
);
