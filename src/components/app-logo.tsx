import type { FC } from 'react';
import Image from 'next/image';

export const AppLogo: FC = () => {
  return (
    <div className="flex items-center gap-3">
      <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 shadow-sm ring-1 ring-primary/20">
        <Image
          src="/images/logo.svg"
          alt="EmpowerYou logo"
          width={32}
          height={32}
          className="h-8 w-8"
          priority
        />
      </span>
      <div className="leading-tight">
        <h1 className="font-headline text-xl font-semibold tracking-tight text-foreground">
          EmpowerYou
        </h1>
        <p className="text-xs text-muted-foreground">A quiet place to grow</p>
      </div>
    </div>
  );
};
