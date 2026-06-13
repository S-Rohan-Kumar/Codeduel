import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  return <DashboardClient userId={userId} />;
}
