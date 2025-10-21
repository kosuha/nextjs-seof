# 테마 토큰 가이드

## 구성 개요

- **CSS 변수 루트 정의**: `src/app/globals.css`의 `:root`와 `.dark` 블록에서 라이트/다크 토큰 값을 선언한다.
- **Tailwind 연동**: `tailwind.config.ts`에서 `colors.border` 등 토큰 이름을 CSS 변수로 맵핑해 유틸리티 클래스에서 재사용한다.
- **TypeScript 참조**: `src/lib/theme/tokens.ts`에 라이트/다크 팔레트를 객체 형태로 보관해 런타임 테마 전환이나 Storybook, 문서화 도구에서 동기화된 값으로 활용한다.

## 토큰 목록

| 토큰 | CSS 변수 | Light | Dark | 사용 맥락 |
| --- | --- | --- | --- | --- |
| `background` | `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | 페이지 배경 |
| `foreground` | `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | 기본 텍스트 |
| `card` / `cardForeground` | `--card` / `--card-foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` | 카드 컨테이너 |
| `popover` / `popoverForeground` | `--popover` / `--popover-foreground` | `oklch(1 0 0)` / `oklch(0.145 0 0)` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` | 팝오버 & 모달 |
| `primary` / `primaryForeground` | `--primary` / `--primary-foreground` | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` | `oklch(0.922 0 0)` / `oklch(0.205 0 0)` | 주요 CTA |
| `secondary` / `secondaryForeground` | `--secondary` / `--secondary-foreground` | `oklch(0.97 0 0)` / `oklch(0.205 0 0)` | `oklch(0.269 0 0)` / `oklch(0.985 0 0)` | 보조 버튼 |
| `muted` / `mutedForeground` | `--muted` / `--muted-foreground` | `oklch(0.97 0 0)` / `oklch(0.556 0 0)` | `oklch(0.269 0 0)` / `oklch(0.708 0 0)` | 서브 텍스트 |
| `accent` / `accentForeground` | `--accent` / `--accent-foreground` | `oklch(0.97 0 0)` / `oklch(0.205 0 0)` | `oklch(0.269 0 0)` / `oklch(0.985 0 0)` | 강조 섹션 |
| `destructive` / `destructiveForeground` | `--destructive` / `--destructive-foreground` | `oklch(0.577 0.245 27.325)` / `oklch(0.985 0 0)` | `oklch(0.704 0.191 22.216)` / `oklch(0.205 0 0)` | 위험 경고 |
| `border`, `input`, `ring` | `--border`, `--input`, `--ring` | `oklch(0.922 0 0)`, `oklch(0.922 0 0)`, `oklch(0.708 0 0)` | `oklch(1 0 0 / 10%)`, `oklch(1 0 0 / 15%)`, `oklch(0.556 0 0)` | 경계 및 포커스 |
| `chart1` ~ `chart5` | `--chart-1` ~ `--chart-5` | 다중 oklch 팔레트 | 다중 oklch 팔레트 | 차트 색상 |
| `sidebar*` | `--sidebar` 등 | 라이트 팔레트 | 다크 팔레트 | 사이드바 모듈 |

> 전체 토큰 및 실제 값은 `src/lib/theme/tokens.ts`를 싱글 소스로 사용한다.

## CSS 변수 적용 전략

1. **전역 선언**: `:root`에 라이트 토큰을 선언하고 `.dark` 클래스에 다크 토큰을 덮어쓴다. 추후 `html` 또는 `body`에 `.dark`를 토글한다.
2. **Tailwind 활용**: Tailwind 구성의 `colors.*` 항목은 `var(--token)`을 바라보므로, 유틸리티 클래스 사용 시 토큰이 자동으로 반영된다.
3. **컴포넌트 정리 계획**:
   - 기존 `bg-white`, `text-black` 등 하드코딩된 색상은 토큰 기반 클래스(`bg-background`, `text-foreground`, `bg-card` 등)로 교체한다.
   - 커스텀 CSS가 필요한 경우 CSS 변수(`var(--token)`)를 직접 참조한다.
4. **확장성**: 차후 `highContrast`, `dim` 등 새로운 토널 스케일을 추가할 때는 `tokens.ts`에서 팔레트를 확장하고, CSS 변수 선언부를 동기화한다.

## 적용 위치 체크리스트

- [x] Tailwind 색상 토큰 (`tailwind.config.ts`)
- [x] 전역 CSS 선언 (`src/app/globals.css`)
- [x] 테마 상태 관리 후 HTML/Body 클래스 토글 (`src/app/providers/ThemeProvider.tsx`)
- [x] 컴포넌트 색상 마이그레이션 (`src/components/**/*`)
- [x] 사용자 토글 UI 및 문서 업데이트 (`AGENTS.md`, `README.md`)

체크리스트는 다크 모드 도입 최소 요건을 충족한 상태이며, 추가 테마(하이 콘트라스트 등)를 도입할 때 갱신해 사용한다.
