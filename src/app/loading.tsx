import { AppLogo } from '@/components/app-logo';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="animate-pulse">
        <AppLogo />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Loading your personalized space...</p>
    </div>
  );
}
