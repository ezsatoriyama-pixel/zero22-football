'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { isApprovedByApi } from './activationCodes';

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

const maskPhone = (phone: string) => phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');

const getAccounts = (): StoredAccount[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('zero22-accounts') || '[]');
  } catch {
    return [];
  }
};

const saveAccounts = (accounts: StoredAccount[]) => {
  localStorage.setItem('zero22-accounts', JSON.stringify(accounts));
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('zero22-user') || localStorage.getItem('fp-user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.phone) {
          setUser({
            phone: parsed.phone.replace(/\*/g, '0'),
            maskedPhone: parsed.maskedPhone || parsed.phone,
            isPro: parsed.isPro ?? false,
            proType: parsed.isPro ? 'lifetime' : undefined,
          });
        }
      } catch {}
    }
  }, []);

  // Poll for admin-approved activation (every 3 seconds) via API
  useEffect(() => {
    if (!user || user.isPro) return;
    const phoneRaw = user.phone;
    let active = true;
    const check = async () => {
      const approved = await isApprovedByApi(phoneRaw);
      if (!approved || !active) return;
      const accounts = getAccounts().map((a) =>
        a.phone === phoneRaw ? { ...a, isPro: true, proType: 'lifetime' as const } : a,
      );
      saveAccounts(accounts);
      setUser((prev) => prev?.phone === phoneRaw ? { ...prev, isPro: true, proType: 'lifetime' } : prev);
      localStorage.setItem('zero22-user', JSON.stringify({ phone: phoneRaw, maskedPhone: user.maskedPhone, isPro: true, proType: 'lifetime' }));
      localStorage.removeItem('fp-user');
    };
    check();
    const interval = setInterval(check, 3000);
    return () => { active = false; clearInterval(interval); };
  }, [user?.phone, user?.isPro]);

  const saveUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('zero22-user', JSON.stringify(u));
      localStorage.removeItem('fp-user');
    } else {
      localStorage.removeItem('zero22-user');
      localStorage.removeItem('fp-user');
    }
  };

  const register = useCallback((phone: string, password: string) => {
    const accounts = getAccounts();
    if (accounts.some((a) => a.phone === phone)) {
      return { ok: false, message: '该手机号已注册，请直接登录' };
    }
    const account: StoredAccount = { phone, password, isPro: false };
    accounts.push(account);
    saveAccounts(accounts);
    saveUser({ phone, maskedPhone: maskPhone(phone), isPro: false });
    return { ok: true, message: '注册成功，已自动登录' };
  }, []);

  const login = useCallback((phone: string, password: string) => {
    const accounts = getAccounts();
    const account = accounts.find((a) => a.phone === phone);
    if (!account) return { ok: false, message: '该手机号未注册，请先注册' };
    if (account.password !== password) return { ok: false, message: '密码错误' };
    saveUser({
      phone,
      maskedPhone: maskPhone(phone),
      isPro: account.isPro,
      proType: account.isPro ? 'lifetime' : undefined,
    });
    return { ok: true, message: '登录成功' };
  }, []);

  const logout = useCallback(() => {
    saveUser(null);
  }, []);

  const completePaidUpgrade = useCallback(
    (targetPhone?: string) => {
      const resolvedPhone = targetPhone || user?.phone;
      if (!resolvedPhone) return;

      const accounts = getAccounts().map((a) =>
        a.phone === resolvedPhone ? { ...a, isPro: true, proType: 'lifetime' as const } : a,
      );
      saveAccounts(accounts);

      if (user?.phone === resolvedPhone) {
        saveUser({ ...user, isPro: true, proType: 'lifetime' });
      }
    },
    [user],
  );

  const upgradeToPro = useCallback(() => {
    if (!user) return;
    completePaidUpgrade(user.phone);
  }, [completePaidUpgrade, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        login,
        logout,
        upgradeToPro,
        completePaidUpgrade,
        isLoggedIn: !!user,
        isPro: user?.isPro ?? false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
