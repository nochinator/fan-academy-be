import { compare, hash } from 'bcrypt';

async function generatePassword(password: string): Promise<string> {
  return await hash(password, 10);
}

async function validatePassword(formPassword: string, userPassword: string): Promise<boolean> {
  return await compare(formPassword, userPassword);
} // FIXME: remove function if not used

export { generatePassword, validatePassword };
