import express from "express";
import bodyParser from "body-parser";
import { Op } from "sequelize";
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

    // Find matching contacts
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
      // Unique entry → insert
      await Contact.create({ email, phoneNumber, linkPrecedence: "primary" }, { transaction: t });
      response = { message: "Unique entry. Added to database." };
    } else {
      const emailsSet = new Set();
      const phonesSet = new Set();

      matchedContacts.forEach(c => {
        if (c.email) emailsSet.add(c.email);
        if (c.phoneNumber) phonesSet.add(c.phoneNumber);
      });

      if (emailsSet.has(email)) {
        phonesSet.add(phoneNumber); // include current input
        response = { email, phoneNumber: Array.from(phonesSet) };
      } else if (phonesSet.has(phoneNumber)) {
        emailsSet.add(email); // include current input
        response = { email: Array.from(emailsSet), phoneNumber };
      } else {
        // Rare fallback
        await Contact.create({ email, phoneNumber, linkPrecedence: "primary" }, { transaction: t });
        response = { message: "Unique entry. Added to database." };
      }
    }

    await t.commit();
    res.json(response); // send only relevant output

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
