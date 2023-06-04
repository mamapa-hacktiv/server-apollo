// SDK initialization
import { config } from "dotenv"
config()
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY_IMAGEKIT,
  privateKey: process.env.PRIVATE_KEY_IMAGEKIT,
  urlEndpoint: process.env.URL_IMAGEKIT
});

export default imagekit;