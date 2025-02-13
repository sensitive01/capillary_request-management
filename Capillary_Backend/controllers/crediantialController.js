const Crediantials = require("../models/apiCrediantails");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const generateRandomPassword = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from(crypto.randomFillSync(new Uint8Array(length)))
    .map((x) => chars[x % chars.length])
    .join("");
};

const createCrediantials = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await Crediantials.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }


    const secretKey = crypto.randomBytes(32).toString("hex");


    const plainPassword = generateRandomPassword();


    const hashedPassword = await bcrypt.hash(plainPassword, 10);


    const newCrediantials = new Crediantials({
      email,
      secretKey,
      password: hashedPassword,
    });

    await newCrediantials.save();

    res.status(201).json({
      message: "Credentials created successfully",
      secretKey,
      password: plainPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createCrediantials,
};
