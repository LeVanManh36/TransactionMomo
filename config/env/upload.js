const {UPLOAD_HOST, UPLOAD_PORT, UPLOAD_DIR, MEDIA_DIR, INSTALLATION} = process.env;

module.exports = {
  UPLOAD_HOST: UPLOAD_HOST || "http://127.0.0.1",
  UPLOAD_PORT: UPLOAD_PORT || "8080",
  UPLOAD_DIR: UPLOAD_DIR || "/var/www/upload",
  MEDIA_DIR: MEDIA_DIR || "/var/www/media",
  INSTALLATION: INSTALLATION || "momo",
}
