const Users = require("../model/users");
const sequelizeIntance = require("../startup/db");

const getUsers = async () => {
  let transaction;
  try {
    transaction = await sequelizeIntance.transaction();
    const users = await Users.findAll({
      where: {
        notificationOn: true,
      },
      attributes: ["userId", "username", "firstName", "lastName"],
      transaction,
    });
    if (!users || users.length === 0) {
      console.log("No users found.");
      if (transaction) await transaction.rollback();
      return [];
    }
    if (transaction) await transaction.commit();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    if (transaction) await transaction.rollback();
    throw error;
  }
};

module.exports = {
  getUsers,
};
