# SEOF 웹

## 소개

SEOF는 대학가 자취방 리뷰를 공유하는 Next.js 기반 웹 애플리케이션입니다. Supabase 인증과 Tailwind 기반 디자인 시스템을 활용하며, 라이트/다크 모드 전환을 지원합니다.

## 개발 환경 실행

개발 서버 실행:

```bash
pnpm install
pnpm dev
```

브라우저에서 <http://localhost:3000>을 열면 변경 사항을 실시간으로 확인할 수 있습니다.

## 테마 시스템

다크 모드는 CSS 변수와 `ThemeProvider`를 기반으로 동작합니다.

- 전역 CSS 변수 정의: `src/app/globals.css`
- 색상 토큰 소스: `src/lib/theme/tokens.ts`
- 상태 관리 훅: `src/hooks/useThemeManager.ts`
- 컨텍스트 공급자: `src/app/providers/ThemeProvider.tsx`

### 사용자 전환

- 헤더 우측 상단의 토글(`ThemeToggle`)로 라이트/다크 모드를 전환
- 모바일과 데스크톱에서 동일한 버튼 사용
- 초기 로딩 시 시스템 테마 → 사용자 저장 테마 순으로 적용

### 개발자 가이드

- 컴포넌트 색상은 `bg-background`, `text-foreground` 등 토큰 기반 Tailwind 유틸리티를 사용
- 토큰 목록은 `docs/theme-tokens.md` 참고
- 새 테마 모드를 추가할 경우 `themeTokens`/CSS 변수 선언/문서를 동시 업데이트

## QA 체크리스트

- [ ] 라이트 모드에서 핵심 화면(홈, 리뷰, 마이페이지) UI 확인
- [ ] 다크 모드에서 동일 화면 대비/콘트라스트 확인
- [ ] 헤더 토글 동작과 로컬 저장소 값 반영 확인
- [ ] 시스템 테마를 변경하고 페이지 재로딩 시 초기 테마 재적용 확인

## 참고 문서

- Next.js App Router: <https://nextjs.org/docs>
- Supabase Auth Helpers: <https://supabase.com/docs/guides/auth>
- Tailwind CSS: <https://tailwindcss.com/docs>
