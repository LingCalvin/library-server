import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = new PhoneNumberUtil();

/**
 * Converts a phone number to E.164 format.
 *
 * @param phoneNumber - The phone number to normalize
 * @returns The phone number formatted according to E.164
 */
export function normalize(phoneNumber: string) {
  return phoneUtil.format(phoneUtil.parse(phoneNumber), PhoneNumberFormat.E164);
}
