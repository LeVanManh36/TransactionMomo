const {AUTH_TYPE, API_AUTH_KEY} = process.env;

module.exports = {
  // Service Authentication
  AUTH_TYPE: AUTH_TYPE || "local",
  API_AUTH_KEY: API_AUTH_KEY || "4012",
}
