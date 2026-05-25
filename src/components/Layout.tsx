import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed inset-0 bg-neutral-950 flex justify-center overflow-hidden">
      <div className="w-full max-w-md h-full bg-black relative shadow-2xl border-x border-white/5 flex flex-col">
        {children}
      </div>
    </div>
  );
};
