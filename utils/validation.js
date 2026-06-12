const validator = require("validator");
const { hashedPassword, comparedPassword } = require("./password");

const signUpValidation = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("First name and last name can't be empty");
  } else if (firstName.length < 3 || firstName.length > 20) {
    throw new Error("First name length should be 3-20 charaters");
  } else if (lastName.length < 3 || lastName.length > 20) {
    throw new Error("Last name length should be 3-20 charaters");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is invalid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
};

const editProfileValidation = (req) => {
  const userData = req.body;
  const editableFields = ["firstName", "lastName", "skills", "age", "gender"];
  const isEditable = Object.keys(userData).every((field) =>
    editableFields.includes(field),
  );

  if (!isEditable) {
    throw new Error("Illegal fields to update");
  }
  Object.keys(userData).forEach((field) => {
    if (field === "firstName" || field === "lastName") {
      if (!userData[field]) {
        throw new Error("First name and last name can't be empty");
      } else if (userData[field].length < 3 || userData[field].length > 20) {
        throw new Error("First name length should be 3-20 charaters");
      }
    }
  });
};

const updatePasswordValidate = async (req) => {
  const { password } = req.body;
  const currentPassword = req.user.password;
  if (!password) {
    throw new Error("Password to update not found");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
  const isSamePass = await comparedPassword(password, currentPassword);
  if (isSamePass) {
    throw new Error("New password couldn't be same as old password");
  }
};

module.exports = {
  signUpValidation,
  editProfileValidation,
  updatePasswordValidate,
};
