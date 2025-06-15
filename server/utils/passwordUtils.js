// Create a new utility file for consistent password handling

import bcrypt from 'bcryptjs';

// Standard salt rounds - keep this consistent
const SALT_ROUNDS = 10;

/**
 * Hash a password
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  if (!password) throw new Error('Password is required');
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password to check
 * @param {string} hash - Hashed password to compare against
 * @returns {Promise<boolean>} True if password matches
 */
export const comparePassword = async (password, hash) => {
  if (!password || !hash) throw new Error('Password and hash are required');
  return bcrypt.compare(password, hash);
};