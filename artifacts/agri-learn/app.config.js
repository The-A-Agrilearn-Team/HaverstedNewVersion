const origin = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : "http://localhost:5000";

const baseConfig = require("./app.json");

module.exports = {
  ...baseConfig,
  expo: {
    ...baseConfig.expo,
    plugins: [
      ["expo-router", { origin }],
      "expo-font",
      "expo-web-browser",
    ],
  },
};