import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PracticeClient from './PracticeClient';

export default async function PracticePage({ params }: { params: Promise<{ problemId: string }> }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  const { problemId } = await params;

  return <PracticeClient problemId={problemId} userId={userId} />;
}
