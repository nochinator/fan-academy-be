import { config } from "dotenv";

config();

const MONGODB_URI = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI  : process.env.MONGODB_URI;
const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;

export { GOOGLE_CLIENT_ID, GOOGLE_SECRET, MONGODB_URI, PORT, SECRET };
