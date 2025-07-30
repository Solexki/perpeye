const Users = require("../model/users");
const sequelizeIntance = require("../startup/db");

const getUsers = async (
  receiveSignalOn = null,
  listingNotification = null,
  notificationOn = true
) => {
  const where = {};
  if (notificationOn !== null) where.notificationOn = true;
  if (receiveSignalOn !== null) where.receiveSignals = true;
  if (listingNotification !== null) where.receiveNewListingsNotification = true;
  try {
    const users = await Users.findAll({
      where,
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

const getUser = async (userId) => {
  try {
    const user = await Users.findOne({
      where: {
        userId,
      },
      attributes: [
        "userId",
        "username",
        "firstName",
        "notificationOn",
        "receiveSignals",
        "receiveNewListingsNotification",
      ],
    });
    if (!user) {
      return {
        success: false,
        message:
          "You are not on the DataBase yet, Please click /start to sign up",
      };
    }
    return { success: true, user };
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

const toggleNotification = async (userId) => {
  try {
    const { success, user, message } = await getUser(userId);
    if (!success || !user) return message;
    if (success && user) {
      user.notificationOn = !user.notificationOn;
      await user.save();
    }
    return user.notificationOn;
  } catch (err) {
    throw err;
  }
};
const togglereceiveSignals = async (userId) => {
  try {
    const { success, user, message } = await getUser(userId);
    if (!success || !user) return message;
    if (success && user) {
      user.receiveSignals = !user.receiveSignals;
      await user.save();
    }
    return user.receiveSignals;
  } catch (err) {
    throw err;
  }
};
const togglereceiveNewListions = async (userId) => {
  try {
    const { success, user, message } = await getUser(userId);
    if (!success || !user) return message;
    if (success && user) {
      user.receiveNewListingsNotification =
        !user.receiveNewListingsNotification;
      await user.save();
    }
    return user.receiveNewListingsNotification;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  toggleNotification,
  togglereceiveSignals,
  togglereceiveNewListions,
  getUsers,
  createUserIfNotExists,
  getUser,
};
