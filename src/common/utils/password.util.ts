import * as argon2 from 'argon2';
import * as generator from 'generate-password';

export function generateHash(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export function verify(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}

export function generate(length: number): string {
  return generator.generate({
    length,
    numbers: true,
    symbols: true,
    lowercase: true,
    uppercase: true,
  });
}
