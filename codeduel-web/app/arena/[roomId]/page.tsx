import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ArenaClient from './ArenaClient';

export default async function ArenaPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  const { roomId } = await params;

  return <ArenaClient roomId={roomId} userId={userId} />;
}
