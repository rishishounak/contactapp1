// server.js
import express from "express";
import bodyParser from "body-parser";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { sequelize } from "./models/index.js";
import { Contact } from "./models/contact.js";

const app = express();
app.use(bodyParser.json());

app.post("/identify", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { email, phoneNumber } = req.body;

    if (!email || !phoneNumber) {
      await t.rollback();
      return res.status(400).json({ error: "Provide both email and phoneNumber" });
    }

    // Find contacts matching either email or phoneNumber
    const matchedContacts = await Contact.findAll({
      where: {
        [Op.or]: [{ email }, { phoneNumber }],
        deletedAt: null,
      },
      order: [["createdAt", "ASC"]],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    let response;

    if (matchedContacts.length === 0) {
      // Unique entry → insert into DB
      await Contact.create(
        { email, phoneNumber, linkPrecedence: "primary" },
        { transaction: t }
      );
      response = { message: "Unique entry. Added to database." };
    } else {
      const emailsSet = new Set();
      const phonesSet = new Set();

      matchedContacts.forEach(c => {
        if (c.email) emailsSet.add(c.email);
        if (c.phoneNumber) phonesSet.add(c.phoneNumber);
      });

      if (emailsSet.has(email)) {
        phonesSet.add(phoneNumber);
        response = {
          email: email,
          phoneNumber: Array.from(phonesSet),
        };
      } else if (phonesSet.has(phoneNumber)) {
        emailsSet.add(email);
        response = {
          email: Array.from(emailsSet),
          phoneNumber: phoneNumber,
        };
      } else {
        response = { message: "Unique entry. Added to database." };
        await Contact.create(
          { email, phoneNumber, linkPrecedence: "primary" },
          { transaction: t }
        );
      }
    }

    // Get full DB content
    const allContacts = await Contact.findAll({ transaction: t });
    const dbContent = {};
    allContacts.forEach(c => {
      dbContent[c.id] = {
        email: c.email,
        phoneNumber: c.phoneNumber,
        linkPrecedence: c.linkPrecedence,
        linkedId: c.linkedId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        deletedAt: c.deletedAt,
      };
    });

    // Combine response and DB snapshot
    const output = {
      response,
      message: "Full contact database content included below.",
      contactsDB: dbContent,
    };

    // Write to output.txt
    const filePath = path.join(process.cwd(), "output.txt");
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2), "utf-8");

    await t.commit();
    res.json(output);
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
