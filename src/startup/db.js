const { Sequelize } = require("sequelize");

const sequelizeIntance = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    define: {
      timestamps: true,
      freezeTableName: true,
    },
    logging: false,
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === "production"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : undefined,
    },
    pool: {
      max: 20,
      min: 1,
      acquire: 30000,
      idle: 10000,
      evict: 10000,
    },
  }
);

sequelizeIntance
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

(async () => {
  try {
    await sequelizeIntance.sync({ alter: true });
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing the database:", error);
  }
})();

module.exports = sequelizeIntance;
