# seof 웹 앱 UI 가이드

## 디자인 토큰

- **기본 팔레트**: Radix Colors `neutral` 스케일을 기반으로 Tailwind CSS 변수(`--primary`, `--background` 등)를 정의했습니다.
- **라이트/다크 모드**: `:root`와 `.dark`에서 각각 OKLCH 값으로 토큰을 설정하여 명도 일관성을 유지합니다.
- **글꼴**: `Geist Sans`, `Geist Mono`를 기본 폰트로 사용하며 Tailwind `font-sans`, `font-mono`에 매핑했습니다.
- **모서리 반경**: `--radius`를 기준으로 `sm`, `md`, `lg`, `xl` 반경을 계산해 컴포넌트 간 일관성을 확보합니다.

## 기본 컴포넌트

| 컴포넌트 | 파일                             | 설명                                                                         |
| -------- | -------------------------------- | ---------------------------------------------------------------------------- |
| Button   | `src/components/ui/button.tsx`   | 기본/outline/ghost 등 다양한 변형을 `class-variance-authority`로 제공합니다. |
| Input    | `src/components/ui/input.tsx`    | 폼 필드 공통 스타일과 상태(비활성, 오류)를 정의합니다.                       |
| Card     | `src/components/ui/card.tsx`     | 콘텐츠 래퍼. 헤더, 본문, 푸터 섹션을 제공합니다.                             |
| Select   | `src/components/ui/select.tsx`   | Radix Select 프리미티브를 사용한 드롭다운 컴포넌트입니다.                    |
| Textarea | `src/components/ui/textarea.tsx` | 멀티라인 입력 필드.                                                          |
| Label    | `src/components/ui/label.tsx`    | 폼 레이블.                                                                   |
| Form     | `src/components/ui/form.tsx`     | `react-hook-form`과 `zod` 통합을 위한 유틸리티 컴포넌트입니다.               |

필요한 추가 컴포넌트는 `npx shadcn@latest add <component>` 명령으로 확장할 수 있습니다.

## 사용 지침

1. **스타일 결합**: `cn` 유틸(`src/lib/utils.ts`)로 Tailwind 클래스와 조건부 스타일을 합칩니다.
2. **상태 표현**: 활성/비활성/오류 상태는 Tailwind 컬러 토큰(`background`, `ring`, `border`)을 사용합니다.
3. **접근성**: Radix Primitives에 내장된 aria 속성을 적극 활용하고, 포커스 링은 `outline-ring/50` 규칙으로 통일합니다.
4. **애니메이션**: `tailwindcss-animate` 기반 키프레임(`accordion-up/down`)을 활용해 확장/축소 인터랙션을 구현합니다.
5. **다크 모드**: UI에서 색상을 지정할 때는 반드시 변수 기반 클래스(`bg-background`, `text-foreground` 등)를 사용합니다.

## 추가 작업 체크리스트

- [ ] 요구되는 shadcn/ui 컴포넌트가 모두 포함되어 있는지 확인
- [ ] 새 컴포넌트 추가 시 디자인 토큰과 접근성 지침을 준수
- [ ] 페이지별 Figma 디자인에 맞춰 변형(`variant`)이 필요하면 `cva` 패턴으로 확장
