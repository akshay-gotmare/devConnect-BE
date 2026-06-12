const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const hashedPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparedPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashedPassword,
  comparedPassword,
};
