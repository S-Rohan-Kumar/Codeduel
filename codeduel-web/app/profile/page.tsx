import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '../../lib/prisma';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  // Find user to obtain member since date
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true }
  });

  const memberSince = user?.createdAt ? user.createdAt.toISOString() : new Date().toISOString();

  return <ProfileClient userId={userId} memberSince={memberSince} />;
}
