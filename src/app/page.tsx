import { redirect } from 'next/navigation';

// Artificial delay to ensure loading.tsx is shown
async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function RootPage() {
  await wait(1000); // Wait for 1 second
  redirect('/dashboard');
}
