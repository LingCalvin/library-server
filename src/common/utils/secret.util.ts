import { generate } from './password.util';

export function generateTokenSecret() {
  return generate(128);
}
