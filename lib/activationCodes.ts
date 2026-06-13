// 激活码系统 - 预生成 100 个激活码
// 你把这些激活码给付费用户，每个只能用一次

const ALL_CODES: string[] = [
  'Z22-PRO-001A', 'Z22-PRO-002B', 'Z22-PRO-003C', 'Z22-PRO-004D', 'Z22-PRO-005E',
  'Z22-PRO-006F', 'Z22-PRO-007G', 'Z22-PRO-008H', 'Z22-PRO-009J', 'Z22-PRO-010K',
  'Z22-PRO-011L', 'Z22-PRO-012M', 'Z22-PRO-013N', 'Z22-PRO-014P', 'Z22-PRO-015Q',
  'Z22-PRO-016R', 'Z22-PRO-017S', 'Z22-PRO-018T', 'Z22-PRO-019U', 'Z22-PRO-020V',
  'Z22-PRO-021W', 'Z22-PRO-022X', 'Z22-PRO-023Y', 'Z22-PRO-024Z', 'Z22-PRO-025A',
  'Z22-PRO-026B', 'Z22-PRO-027C', 'Z22-PRO-028D', 'Z22-PRO-029E', 'Z22-PRO-030F',
  'Z22-PRO-031G', 'Z22-PRO-032H', 'Z22-PRO-033J', 'Z22-PRO-034K', 'Z22-PRO-035L',
  'Z22-PRO-036M', 'Z22-PRO-037N', 'Z22-PRO-038P', 'Z22-PRO-039Q', 'Z22-PRO-040R',
  'Z22-PRO-041S', 'Z22-PRO-042T', 'Z22-PRO-043U', 'Z22-PRO-044V', 'Z22-PRO-045W',
  'Z22-PRO-046X', 'Z22-PRO-047Y', 'Z22-PRO-048Z', 'Z22-PRO-049A', 'Z22-PRO-050B',
  'Z22-PRO-051C', 'Z22-PRO-052D', 'Z22-PRO-053E', 'Z22-PRO-054F', 'Z22-PRO-055G',
  'Z22-PRO-056H', 'Z22-PRO-057J', 'Z22-PRO-058K', 'Z22-PRO-059L', 'Z22-PRO-060M',
  'Z22-PRO-061N', 'Z22-PRO-062P', 'Z22-PRO-063Q', 'Z22-PRO-064R', 'Z22-PRO-065S',
  'Z22-PRO-066T', 'Z22-PRO-067U', 'Z22-PRO-068V', 'Z22-PRO-069W', 'Z22-PRO-070X',
  'Z22-PRO-071Y', 'Z22-PRO-072Z', 'Z22-PRO-073A', 'Z22-PRO-074B', 'Z22-PRO-075C',
  'Z22-PRO-076D', 'Z22-PRO-077E', 'Z22-PRO-078F', 'Z22-PRO-079G', 'Z22-PRO-080H',
  'Z22-PRO-081J', 'Z22-PRO-082K', 'Z22-PRO-083L', 'Z22-PRO-084M', 'Z22-PRO-085N',
  'Z22-PRO-086P', 'Z22-PRO-087Q', 'Z22-PRO-088R', 'Z22-PRO-089S', 'Z22-PRO-090T',
  'Z22-PRO-091U', 'Z22-PRO-092V', 'Z22-PRO-093W', 'Z22-PRO-094X', 'Z22-PRO-095Y',
  'Z22-PRO-096Z', 'Z22-PRO-097A', 'Z22-PRO-098B', 'Z22-PRO-099C', 'Z22-PRO-100D',
];

// 验证激活码是否有效
export function validateActivationCode(code: string): { ok: boolean; message: string } {
  if (!code || typeof code !== 'string') {
    return { ok: false, message: '请输入激活码' };
  }

  const normalized = code.trim().toUpperCase();

  if (!ALL_CODES.includes(normalized)) {
    return { ok: false, message: '激活码无效，请检查后重试' };
  }

  // 检查是否已被使用
  const used = getUsedCodes();
  if (used.has(normalized)) {
    return { ok: false, message: '该激活码已被使用' };
  }

  return { ok: true, message: '激活码验证通过' };
}

// 标记激活码为已使用
export function consumeActivationCode(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  const used = getUsedCodes();
  used.add(normalized);
  saveUsedCodes(used);
  return true;
}

function getUsedCodes(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem('zero22-used-codes') || '[]'));
  } catch {
    return new Set();
  }
}

function saveUsedCodes(used: Set<string>) {
  localStorage.setItem('zero22-used-codes', JSON.stringify([...used]));
}

// 获取未使用的激活码列表（管理后台用）
export function getAvailableCodes(): string[] {
  const used = getUsedCodes();
  return ALL_CODES.filter(c => !used.has(c));
}

export function getUsedCodesList(): string[] {
  return [...getUsedCodes()];
}
