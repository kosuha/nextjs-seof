"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { REVIEW_SORT_LABELS, reviewSortOptions, rentTypeOptions } from "@/lib/data/filters";
import type { ReviewSortOption } from "@/lib/data/filters";
import type { RentType } from "@/lib/types/supabase";

const RENT_TYPE_ALL_VALUE = "all";

type ReviewFiltersProps = {
  totalCount: number;
  defaultSort: ReviewSortOption;
  defaultRentType?: RentType;
  defaultSearch?: string;
};

export function ReviewFilters({
  totalCount,
  defaultSort,
  defaultRentType,
  defaultSearch,
}: ReviewFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultSearch ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(defaultSearch ?? "");
  }, [defaultSearch]);

  const applyUpdates = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams?.toString());
    updater(params);
    params.delete("page");
    const nextPath = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => {
      router.replace(nextPath, { scroll: false });
    });
  };

  const updateParam = (key: string, value?: string) => {
    applyUpdates((params) => {
      if (value && value.length > 0) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParam("q", query.trim());
  };

  return (
    <section className="border-border bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Filter className="size-4" aria-hidden />
          <span>
            총 <strong className="text-foreground">{totalCount.toLocaleString()}</strong>
            개의 리뷰가 있습니다.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={defaultSort}
            onValueChange={(value) => updateParam("sort", value)}
          >
            <SelectTrigger className="w-[170px]" aria-label="정렬 기준 선택">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              {reviewSortOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {REVIEW_SORT_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={defaultRentType ?? RENT_TYPE_ALL_VALUE}
            onValueChange={(value) => {
              if (value === RENT_TYPE_ALL_VALUE) {
                updateParam("rentType");
                return;
              }
              updateParam("rentType", value);
            }}
          >
            <SelectTrigger className="w-[140px]" aria-label="임대 방식 필터">
              <SelectValue placeholder="임대 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RENT_TYPE_ALL_VALUE}>전체 임대방식</SelectItem>
              {rentTypeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="건물명을 입력해 검색하세요"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0 sm:w-auto">
          <Button className="w-full" type="submit" disabled={isPending}>
            검색
          </Button>
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={() => {
              setQuery("");
              applyUpdates((params) => {
                params.delete("q");
                params.delete("rentType");
                params.delete("sort");
              });
            }}
            disabled={isPending}
          >
            초기화
          </Button>
        </div>
      </form>
    </section>
  );
}
