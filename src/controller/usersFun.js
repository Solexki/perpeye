const Users = require("../model/users");
const sequelizeIntance = require("../startup/db");

const getUsers = async () => {
  try {
    const users = await Users.findAll({
      where: {
        notificationOn: true,
      },
      attributes: ["userId", "username", "firstName", "lastName"],
    });
    if (!users.length) {
      return [];
    }

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const createUserIfNotExists = async (data) => {
  const { username, firstName, lastName, isAdmin, isPremium, chatId } = data;
  let transaction;
  try {
    transaction = await sequelizeIntance.transaction();
    const [user, created] = await Users.findOrCreate({
      where: { userId: chatId },
      defaults: {
        username,
        firstName,
        lastName,
        isAdmin,
        isPremium,
      },
      transaction,
    });

    if (created) {
      console.log(`New user created: ${username}`);
    } else {
      console.log(`User already exists: ${username}`);
    }
    await transaction.commit();
    return user;
  } catch (error) {
    console.error("Error creating or finding user:", error);
    await transaction.rollback();
  }
};
module.exports = {
  getUsers,
  createUserIfNotExists,
};
