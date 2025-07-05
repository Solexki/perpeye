const Users = require("../model/users");

const getUsers = async () => {
  try {
    const users = await Users.findAll({
      where: {
        notificationOn: true,
      },
      attributes: ["userId", "username", "firstName", "lastName"],
    });
    if (!users || users.length === 0) {
      console.log("No users found.");
      return [];
    }

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

module.exports = {
  getUsers,
};
