'use client';

import { ForgotPassword } from '@stackframe/stack';

interface StackForgotPasswordProps {
  fullPage?: boolean;
}

export const StackForgotPassword = ({ fullPage = false }: StackForgotPasswordProps) => {
  return (
    <div className="w-full">
      <ForgotPassword fullPage={fullPage} />
    </div>
  );
}
