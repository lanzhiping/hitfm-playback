const path = require("path");
var ZipPlugin = require("zip-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV || "development",

  entry: {
    "background/index": "./src/background/index.js",
    "popup/index": "./src/popup/index.js",
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },

  target: "web",

  devtool: false,

  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),

    new CopyPlugin([
      {
        from: "src/**/*",
        to: "[path][name].[ext]",
        test: /([^/]+)\/(.+)\.(json|html|css|png)$/,
        transformPath: (targetPath) => targetPath.replace("src/", ""),
      },
    ]),

    process.env.NODE_ENV === "production" &&
      new ZipPlugin({
        filename: "hitfm.zip",
      }),
  ].filter(Boolean),
};
