"use client";

import { useEffect, useId, useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { MainNav } from "@/app/components/main-nav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Gasoek_One } from "next/font/google";

const gasoekOne = Gasoek_One({
  variable: "--font-gasoek-one-regular",
  subsets: ["latin"],
  weight: "400",
});

type BasicUser = {
  id: string;
  email?: string | null;
};

type SiteHeaderProps = {
  user: BasicUser | null;
};

export function SiteHeader({ user: initialUser }: SiteHeaderProps) {
  const { session, isLoading } = useSessionContext();

  const sessionUser = session?.user;
  const user = sessionUser
    ? {
        id: sessionUser.id,
        email: sessionUser.email,
      }
    : initialUser;

  const shouldShowLogin = !user && !isLoading;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuLabelId = useId();

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isMenuOpen]);

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const authButtons = (
    <>
      {user ? (
        <>
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
      ) : null}

      {shouldShowLogin ? (
        <Link href="/login">
          <Button size="sm">로그인</Button>
        </Link>
      ) : null}
    </>
  );

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className={`${gasoekOne.className} text-foreground text-2xl font-semibold`}
          >
            SEOF
          </Link>
          <div className="hidden sm:block">
            <MainNav />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            {authButtons}
            <ThemeToggle />
          </div>
          <button
            type="button"
            className="text-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/50 bg-background/30 sm:hidden"
            onClick={handleToggleMenu}
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-site-nav"
          >
            {isMenuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="sm:hidden">
          <div
            id="mobile-site-nav"
            role="dialog"
            aria-modal="true"
            aria-labelledby={mobileMenuLabelId}
            className="border-border bg-background fixed inset-y-0 right-0 z-50 flex min-h-[100dvh] w-72 max-w-[85%] flex-col border-l shadow-xl"
          >
            <div className="flex h-16 items-center justify-between px-6">
              <Link
                id={mobileMenuLabelId}
                href="/"
                onClick={handleCloseMenu}
                className={`${gasoekOne.className} text-foreground text-xl font-semibold`}
              >
                SEOF
              </Link>
              <button
                type="button"
                className="text-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60"
                onClick={handleCloseMenu}
                aria-label="메뉴 닫기"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-16 pt-6">
              <div className="flex flex-col gap-6">
                <MainNav
                  className="flex-col items-start gap-4 text-base"
                  onNavigate={handleCloseMenu}
                />


                <div className="border-border/80 flex items-center justify-between border-t pt-4">
                  <div className="flex flex-col gap-3">
                    {!user ? (
                      <div className="flex flex gap-3">
                        <Link href="/mypage" onClick={handleCloseMenu}>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            내 정보
                          </Button>
                        </Link>
                        <Link href="/reviews/new" onClick={handleCloseMenu}>
                          <Button
                            size="sm"
                            className="bg-foreground text-background hover:bg-foreground/90 w-full justify-start"
                          >
                            리뷰 작성
                          </Button>
                        </Link>
                      </div>
                    ) : null}

                    {!shouldShowLogin ? (
                      <Link href="/login" onClick={handleCloseMenu}>
                        <Button size="sm" className="w-full justify-start">
                          로그인
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                  
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
