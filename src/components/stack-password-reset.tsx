'use client';

import { PasswordReset } from '@stackframe/stack';

interface StackPasswordResetProps {
  searchParams: Record<string, string>;
  fullPage?: boolean;
}

export const StackPasswordReset = ({ searchParams, fullPage = false }: StackPasswordResetProps) => {
  return (
    <div className="w-full">
      <PasswordReset searchParams={searchParams} fullPage={fullPage} />
    </div>
  );
}
