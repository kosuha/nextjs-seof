import Link from "next/link";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { getServerSession } from "@/lib/supabase/server";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { SupabaseProvider } from "@/app/providers/supabase-provider";
import { SiteHeader } from "@/app/components/site-header";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const pretendard = localFont({
  src: "../../font/PretendardVariable.ttf",
  variable: "--font-pretendard",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SEOF",
  description: "대학가 자취방 리뷰 공유 플랫폼",
};

const themeInitializer = `(function(){try{var storageKey='seof-theme';var root=document.documentElement;if(!root)return;var stored=null;try{stored=window.localStorage.getItem(storageKey);}catch(_){}var isStoredDark=stored==='dark';var isStoredLight=stored==='light';if(!isStoredDark&&!isStoredLight){stored=null;}var systemPrefersDark=false;if(window.matchMedia){systemPrefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;}var theme=stored?stored:(systemPrefersDark?'dark':'light');root.classList.toggle('dark',theme==='dark');root.dataset.theme=theme;root.style.colorScheme=theme;}catch(_){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body className={`${pretendard.variable} antialiased`}>
        <ThemeProvider>
          <SupabaseProvider initialSession={session}>
            <div className="bg-background text-foreground flex min-h-screen flex-col">
              <SiteHeader user={session?.user ?? null} />
              <main className="flex-1">{children}</main>
              <footer className="border-border/60 bg-background/80 border-t">
                <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <p>© {new Date().getFullYear()}. 개포히치하이커스. All rights reserved.</p>
                  <div className="flex gap-4">
                    <Link
                      href="https://seonhoki.notion.site/1738d444fd48805e8ffcc3824acf831a"
                      className="hover:text-foreground transition-colors"
                    >
                      개인정보처리방침
                    </Link>
                    <Link href="https://seonhoki.notion.site/17c8d444fd4880d1be04eb3644a7295b" className="hover:text-foreground transition-colors">
                      이용약관
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-T92YNFT623" />
    </html>
  );
}
