const ADMIN_PASSWORD = 'zero22admin';

const CODES_KEY = 'zero22-activation-codes';
const PENDING_KEY = 'zero22-pending';
const ACTIVATED_KEY = 'zero22-activated';

export interface ActivationCode {
  code: string;
  used: boolean;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

export interface PendingActivation {
  id: string;
  phone: string;
  maskedPhone: string;
  createdAt: string;
}

export interface ActivatedRecord {
  phone: string;
  maskedPhone: string;
  code: string;
  createdAt: string;
  approvedAt: string;
}

// --- Activation Codes ---

function getCodes(): ActivationCode[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CODES_KEY) || '[]'); } catch { return []; }
}
function saveCodes(codes: ActivationCode[]) { localStorage.setItem(CODES_KEY, JSON.stringify(codes)); }

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'Z22-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function generateCodes(count: number): ActivationCode[] {
  const codes = getCodes();
  const now = new Date().toISOString();
  const newCodes: ActivationCode[] = [];
  for (let i = 0; i < count; i++) {
    let code = randomCode();
    while (codes.some((c) => c.code === code)) code = randomCode();
    const entry: ActivationCode = { code, used: false, createdAt: now };
    codes.push(entry);
    newCodes.push(entry);
  }
  saveCodes(codes);
  return newCodes;
}

export function listCodes(): ActivationCode[] { return getCodes(); }

export function redeemCode(code: string, phone: string): { ok: boolean; message: string } {
  const codes = getCodes();
  const entry = codes.find((c) => c.code === code.toUpperCase());
  if (!entry) return { ok: false, message: '激活码无效' };
  if (entry.used) return { ok: false, message: '该激活码已被使用' };
  entry.used = true;
  entry.usedBy = phone;
  entry.usedAt = new Date().toISOString();
  saveCodes(codes);
  return { ok: true, message: '激活成功！Pro 永久会员已解锁 🎉' };
}

export function getUnusedCount(): number { return getCodes().filter((c) => !c.used).length; }

// --- Pending Activations ---

function maskPhone(phone: string) { return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'); }

function getPending(): PendingActivation[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { return []; }
}
function savePending(list: PendingActivation[]) { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); }

export function getActivated(): ActivatedRecord[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(ACTIVATED_KEY) || '[]'); } catch { return []; }
}
function saveActivated(list: ActivatedRecord[]) { localStorage.setItem(ACTIVATED_KEY, JSON.stringify(list)); }

export function submitPendingActivation(phone: string): { ok: boolean; message: string } {
  const pending = getPending();
  if (pending.some((p) => p.phone === phone && !isApproved(phone))) {
    return { ok: false, message: '您已有待确认的激活申请，请耐心等待' };
  }
  const item: PendingActivation = {
    id: `P${Date.now()}`,
    phone,
    maskedPhone: maskPhone(phone),
    createdAt: new Date().toISOString(),
  };
  pending.push(item);
  savePending(pending);

  // Also submit to shared queue (API → JSON file) so cron agent can see it
  fetch('/api/activation/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, maskedPhone: item.maskedPhone }),
  }).catch(() => {});

  return { ok: true, message: '申请已提交，等待管理员确认收款后即可激活' };
}

export function listPending(): PendingActivation[] {
  // Filter out already-approved ones that haven't been cleaned yet
  return getPending().filter((p) => !getActivated().some((a) => a.phone === p.phone));
}

export function approveActivation(id: string): { ok: boolean; message: string; phone?: string } {
  const pending = getPending();
  const item = pending.find((p) => p.id === id);
  if (!item) return { ok: false, message: '申请不存在' };

  // Check if already approved
  const activated = getActivated();
  if (activated.some((a) => a.phone === item.phone)) {
    // Remove from pending
    savePending(pending.filter((p) => p.id !== id));
    return { ok: false, message: '该用户已激活' };
  }

  // Generate and redeem a code
  const codes = generateCodes(1);
  const code = codes[0].code;
  redeemCode(code, item.phone);

  // Record activation
  activated.push({
    phone: item.phone,
    maskedPhone: item.maskedPhone,
    code,
    createdAt: item.createdAt,
    approvedAt: new Date().toISOString(),
  });
  saveActivated(activated);

  // Remove from pending
  savePending(pending.filter((p) => p.id !== id));

  // Also approve via shared queue API so cron agent knows
  fetch('/api/activation/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  }).catch(() => {});

  return { ok: true, message: '已确认激活', phone: item.phone };
}

export function rejectActivation(id: string): { ok: boolean; message: string } {
  const pending = getPending();
  savePending(pending.filter((p) => p.id !== id));
  return { ok: true, message: '已拒绝' };
}

export function isApproved(phone: string): boolean {
  return getActivated().some((a) => a.phone === phone);
}

export async function isApprovedByApi(phone: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/activation/check?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    return data.approved === true;
  } catch {
    return isApproved(phone); // fallback to localStorage
  }
}

export function isPending(phone: string): boolean {
  return getPending().some((p) => p.phone === phone);
}

export function verifyAdmin(password: string): boolean {
  return password === ADMIN_PASSWORD;
}
