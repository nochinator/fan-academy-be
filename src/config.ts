import { config } from "dotenv";

config();

const MONGODB_URI = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGODB_URI  : process.env.MONGODB_URI;
const PORT = process.env.PORT;
const SECRET = process.env.SECRET;

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_TEST_ADDRESS = process.env.EMAIL_TEST_ADDRESS;
const EMAIL_TEST_ADDRESS2 = process.env.EMAIL_TEST_ADDRESS2;
const EMAIL_TEST_ADDRESS3 = process.env.EMAIL_TEST_ADDRESS3;

export { BREVO_API_KEY, EMAIL_TEST_ADDRESS, EMAIL_TEST_ADDRESS2, EMAIL_TEST_ADDRESS3, MONGODB_URI, PORT, SECRET };
