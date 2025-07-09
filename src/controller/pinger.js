const axios = require("axios");

const pingServer = () => {
  setInterval(() => {
    axios
      .get("https://perpeye.onrender.com/")
      .then((res) => console.log("Keeping server alife", res.statusText))
      .catch((err) => console.log(err.message));
  }, 30000);
};

module.exports = pingServer;
