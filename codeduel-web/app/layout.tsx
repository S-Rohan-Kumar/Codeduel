import type { Metadata } from 'next';
import { ClerkProvider, SignInButton, Show, UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CodeDuel',
  description: '1v1 Coding Arena',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  const initials = user?.firstName 
    ? user.firstName.substring(0, 2).toUpperCase() 
    : (user?.username ? user.username.substring(0, 2).toUpperCase() : 'U');

  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-neutral-950 text-neutral-100 min-h-screen flex flex-col antialiased`}>
          <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 border-b border-neutral-900 bg-neutral-950/70 backdrop-blur-md">
            <Link 
              href="/dashboard" 
              className="font-black text-xl tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
            >
              CodeDuel
            </Link>
            <div className="flex items-center gap-4">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200">
                    Sign In
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link 
                  href="/profile" 
                  className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
                >
                  Profile
                </Link>
                <Link 
                  href="/profile" 
                  className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-black text-amber-400 hover:bg-amber-500/20 transition-all shadow-sm"
                  title="View Profile"
                >
                  {initials}
                </Link>
                <UserButton appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 rounded-full border border-neutral-800"
                  }
                }} />
              </Show>
            </div>
          </nav>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}