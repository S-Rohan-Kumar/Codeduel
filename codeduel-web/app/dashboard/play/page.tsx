import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import MatchmakingClient from './MatchmakingClient';
import { redirect } from 'next/navigation';

export default async function PlayPage({
  searchParams
}: {
  searchParams: Promise<{ problemId?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  const { problemId } = await searchParams;

  // Fetch rating from DB
  const userRecord = await prisma.user.findUnique({
    where: { id: userId }
  });

  const rating = userRecord?.rating || 1200;

  return <MatchmakingClient userId={userId} initialRating={rating} problemId={problemId} />;
}
