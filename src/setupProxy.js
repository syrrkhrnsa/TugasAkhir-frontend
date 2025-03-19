const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://wilayah.id",
      changeOrigin: true,
      pathRewrite: { "^/api": "" },
      secure: false, // Nonaktifkan SSL verification jika diperlukan
      timeout: 10000, // Tambahkan timeout (opsional)
    })
  );
};