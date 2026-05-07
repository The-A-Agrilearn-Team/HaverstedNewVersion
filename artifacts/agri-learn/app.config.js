const origin = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL.replace("/api", "")
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