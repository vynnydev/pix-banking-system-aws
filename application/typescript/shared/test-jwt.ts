import { generateAccessToken, verifyAccessToken } from './src/utils/jwt';

const payload = { userId: '123', email: 'test@example.com' };

try {
  const token = generateAccessToken(payload);
  console.log('✅ Token generated:', token);
  
  const decoded = verifyAccessToken(token);
  console.log('✅ Token verified:', decoded);
} catch (error) {
  console.error('❌ Error:', error);
}