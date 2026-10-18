/**
 * Tiện ích mã hóa bảo mật, băm mật khẩu và ẩn danh tính
 */

export async function hashPassword(plainText: string): Promise<string> {
  const salt = 'CA_XA_LAI_VUNG_ANTT_2026';
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText + salt);
  
  if (window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback simple bitwise hash
  let hash = 0;
  const str = plainText + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16) + '00secure';
}

/**
 * Ẩn một phần số CCCD để đảm bảo quyền riêng tư
 * Ví dụ: 087099012345 -> 0870******45
 */
export function maskCCCD(cccd?: string): string {
  if (!cccd || cccd.trim() === '') return 'Chưa cập nhật';
  const clean = cccd.trim();
  if (clean.length < 8) return clean;
  const first = clean.substring(0, 4);
  const last = clean.substring(clean.length - 2);
  const stars = '*'.repeat(Math.max(4, clean.length - 6));
  return `${first}${stars}${last}`;
}

/**
 * Ẩn một phần số tài khoản ngân hàng
 * Ví dụ: 102394857288 -> 1023****88
 */
export function maskBankAccount(account?: string): string {
  if (!account || account.trim() === '') return 'Không có';
  const clean = account.trim();
  if (clean.length < 6) return clean;
  const first = clean.substring(0, 4);
  const last = clean.substring(clean.length - 2);
  return `${first}****${last}`;
}

/**
 * Ẩn một phần số điện thoại
 * Ví dụ: 0912345678 -> 0912***678
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone || phone.trim() === '') return 'Chưa có SĐT';
  const clean = phone.trim();
  if (clean.length < 7) return clean;
  const first = clean.substring(0, 4);
  const last = clean.substring(clean.length - 3);
  return `${first}***${last}`;
}
