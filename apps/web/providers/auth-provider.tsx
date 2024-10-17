'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { RecoilRoot } from 'recoil';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>
    <RecoilRoot>
      {children}
    </RecoilRoot>
  </SessionProvider>;
};
export default AuthProvider;