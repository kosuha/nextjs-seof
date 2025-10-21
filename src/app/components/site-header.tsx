import Link from "next/link";
import { MainNav } from "@/app/components/main-nav";
import { Button } from "@/components/ui/button";
import { Gasoek_One } from "next/font/google";

const gasoekOne = Gasoek_One({
  variable: "--font-gasoek-one-regular",
  subsets: ["latin"],
  weight: "400",
});

type SiteHeaderProps = {
  user: {
    id: string;
    email?: string | null;
  } | null;
};

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`${gasoekOne.className} text-foreground text-2xl font-semibold`}
          >
            SEOF
          </Link>
          <MainNav />
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.email ? (
                <span className="text-muted-foreground hidden text-sm sm:inline-flex">
                  {user.email}
                </span>
              ) : null}
              <Link href="/mypage">
                <Button variant="outline" size="sm">
                  내 정보
                </Button>
              </Link>
              <Link href="/reviews/new">
                <Button
                  size="sm"
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  리뷰 작성
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">로그인</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
