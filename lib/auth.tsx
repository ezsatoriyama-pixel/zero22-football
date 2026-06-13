'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface User {
  phone: string;
  maskedPhone: string;
  isPro: boolean;
  proType?: 'lifetime';
}

interface StoredAccount {
  phone: string;
  password: string;
  isPro: boolean;
  proType?: 'lifetime';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  register: (phone: string, password: string) => { ok: boolean; message: string };
  login: (phone: string, password: string) => { ok: boolean; message: string };
  logout: () => void;
  upgradeToPro: () => void;
  completePaidUpgrade: (phone?: string) => void;
  isLoggedIn: boolean;
  isPro: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  register: () => ({ ok: false, message: '' }),
  login: () => ({ ok: false, message: '' }),
  logout: () => {},
  upgradeToPro: () => {},
  completePaidUpgrade: () => {},
  isLoggedIn: false,
  isPro: false,
});

const normalizePhone = (phone: string) => String(phone || '').replace(/\D/g, '').slice(0, 11);
const maskPhone = (phone: string) => normalizePhone(phone).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');

const readJsonArray = (key: string): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getAccounts = (): StoredAccount[] => {
  if (typeof window === 'undefined') return [];

  const primary = readJsonArray('zero22-accounts');
  const legacy = readJsonArray('users');
  const merged = [...primary, ...legacy];
  const map = new Map<string, StoredAccount>();

  merged.forEach((a: any) => {
    const phone = normalizePhone(a.phone);
    if (!/^1[3-9]\d{9}$/.test(phone)) return;
    const existing = map.get(phone);
    map.set(phone, {
      phone,
      password: String(a.password || ''),
      isPro: Boolean(a.isPro || existing?.isPro),
      proType: a.isPro || existing?.isPro ? 'lifetime' : undefined,
      createdAt: a.createdAt || existing?.createdAt || new Date().toISOString(),
    });
  });

  const accounts = [...map.values()];
  localStorage.setItem('zero22-accounts', JSON.stringify(accounts));
  return accounts;
};

const saveAccounts = (accounts: StoredAccount[]) => {
  const normalized = accounts
    .map((a) => ({ ...a, phone: normalizePhone(a.phone) }))
    .filter((a) => /^1[3-9]\d{9}$/.test(a.phone));
  localStorage.setItem('zero22-accounts', JSON.stringify(normalized));
};

export const getTotalUserCount = (): number => getAccounts().length;
export const getTodayNewUserCount = (): number => {
  const today = new Date().toISOString().slice(0, 10);
  return getAccounts().filter((a) => (a.createdAt || '').slice(0, 10) === today).length;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const saveUser = useCallback((u: User | null) => {
    setUser(u);
    if (u) {
      const clean = { ...u, phone: normalizePhone(u.phone), maskedPhone: maskPhone(u.phone) };
      localStorage.setItem('zero22-user', JSON.stringify(clean));
      localStorage.removeItem('fp-user');
    } else {
      localStorage.removeItem('zero22-user');
      localStorage.removeItem('fp-user');
    }
  }, []);

  useEffect(() => {
    getAccounts(); // migrate legacy accounts once
    const saved = localStorage.getItem('zero22-user') || localStorage.getItem('fp-user');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      const phone = normalizePhone(parsed.phone);
      if (!/^1[3-9]\d{9}$/.test(phone)) return;
      const account = getAccounts().find((a) => a.phone === phone);
      saveUser({
        phone,
        maskedPhone: maskPhone(phone),
        isPro: Boolean(account?.isPro || parsed.isPro),
        proType: account?.isPro || parsed.isPro ? 'lifetime' : undefined,
      });
    } catch {}
  }, [saveUser]);

  const register = useCallback((phoneInput: string, password: string) => {
    const phone = normalizePhone(phoneInput);
    if (!/^1[3-9]\d{9}$/.test(phone)) return { ok: false, message: '请输入正确的 11 位手机号' };

    const accounts = getAccounts();
    const existing = accounts.find((a) => a.phone === phone);
    if (existing) {
      return { ok: false, message: '该手机号已注册，请切换到登录' };
    }

    const account: StoredAccount = {
      phone,
      password,
      isPro: false,
      createdAt: new Date().toISOString(),
    };
    saveAccounts([...accounts, account]);
    saveUser({ phone, maskedPhone: maskPhone(phone), isPro: false });
    return { ok: true, message: '注册成功，已自动登录' };
  }, [saveUser]);

  const login = useCallback((phoneInput: string, password: string) => {
    const phone = normalizePhone(phoneInput);
    const accounts = getAccounts();
    const account = accounts.find((a) => a.phone === phone);
    if (!account) return { ok: false, message: '该手机号未注册，请先注册。注意：静态网站账号只保存在当前浏览器。' };
    if (account.password !== password) return { ok: false, message: '密码错误' };
    saveUser({
      phone,
      maskedPhone: maskPhone(phone),
      isPro: account.isPro,
      proType: account.isPro ? 'lifetime' : undefined,
    });
    return { ok: true, message: '登录成功' };
  }, [saveUser]);

  const logout = useCallback(() => saveUser(null), [saveUser]);

  const completePaidUpgrade = useCallback((targetPhone?: string) => {
    const resolvedPhone = normalizePhone(targetPhone || user?.phone || '');
    if (!resolvedPhone) return;

    const accounts = getAccounts();
    const exists = accounts.some((a) => a.phone === resolvedPhone);
    const next = exists
      ? accounts.map((a) => a.phone === resolvedPhone ? { ...a, isPro: true, proType: 'lifetime' as const } : a)
      : [...accounts, { phone: resolvedPhone, password: '', isPro: true, proType: 'lifetime' as const, createdAt: new Date().toISOString() }];
    saveAccounts(next);

    if (user?.phone === resolvedPhone) {
      saveUser({ ...user, phone: resolvedPhone, maskedPhone: maskPhone(resolvedPhone), isPro: true, proType: 'lifetime' });
    }
  }, [saveUser, user]);

  const upgradeToPro = useCallback(() => {
    if (!user) return;
    completePaidUpgrade(user.phone);
  }, [completePaidUpgrade, user]);

  return (
    <AuthContext.Provider value={{ user, register, login, logout, upgradeToPro, completePaidUpgrade, isLoggedIn: !!user, isPro: user?.isPro ?? false }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
