"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BUILDING_SORT_LABELS,
  buildingSortOptions,
  type BuildingSortOption,
} from "@/lib/data/filters";

type BuildingFiltersProps = {
  totalCount: number;
  defaultSort: BuildingSortOption;
  defaultSearch?: string;
};

export function BuildingFilters({
  totalCount,
  defaultSort,
  defaultSearch,
}: BuildingFiltersProps) {
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
    params.delete("offset");
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
    <section className="border-border bg-muted/40 flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Filter className="size-4" aria-hidden />
          <span>
            총 <strong className="text-foreground">{totalCount.toLocaleString()}</strong>
            건의 건물 정보가 있습니다.
          </span>
        </div>

        <Select
          value={defaultSort}
          onValueChange={(value) => updateParam("sort", value)}
        >
          <SelectTrigger className="w-full sm:w-[220px]" aria-label="정렬 기준 선택">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            {buildingSortOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {BUILDING_SORT_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="건물 이름을 검색하세요"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-10"
            aria-label="건물 검색어 입력"
          />
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0 sm:w-auto">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            검색
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setQuery("");
              applyUpdates((params) => {
                params.delete("q");
                params.delete("sort");
              });
            }}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            초기화
          </Button>
        </div>
      </form>
    </section>
  );
}
