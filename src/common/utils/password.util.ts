import * as argon2 from 'argon2';

export function generateHash(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export function verify(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}
