// SDK initialization

const ImageKit = require("imagekit")

const imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY_IMAGEKIT,
  privateKey: process.env.PRIVATE_KEY_IMAGEKIT,
  urlEndpoint: process.env.URL_IMAGEKIT
});

module.exports = imagekit;