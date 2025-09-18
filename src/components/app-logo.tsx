import { Sparkles } from 'lucide-react';
import type { FC } from 'react';

export const AppLogo: FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="h-8 w-8 text-accent" />
      <h1 className="font-headline text-2xl font-bold text-primary-foreground">
        EmpowerYou
      </h1>
    </div>
  );
};
