import { Sparkles } from 'lucide-react';
import type { FC } from 'react';

export const AppLogo: FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="h-6 w-6 text-accent" />
      <h1 className="font-headline text-xl font-bold text-primary">
        EmpowerYou
      </h1>
    </div>
  );
};
