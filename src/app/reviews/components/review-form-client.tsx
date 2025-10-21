"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { Building, Loader2, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_REVIEW_FORM_VALUES,
  REVIEW_FORM_STEPS,
  RENT_TYPES,
  type BuildingOption,
  type ReviewFormSubmitPayload,
  type ReviewFormSubmitResult,
  type ReviewFormValues,
  reviewFormSchema,
} from "./review-form-types";

declare global {
  interface Window {
    daum?: {
      Postcode: new (config: { oncomplete: (data: KakaoPostcodeData) => void }) => {
        open: () => void;
      };
    };
  }
}

type KakaoPostcodeData = {
  address: string;
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  buildingName: string;
};

export type ReviewFormClientProps = {
  heading?: string;
  steps?: readonly string[];
  mode?: "create" | "edit";
  submitLabel?: string;
  successMessage?: string;
  onSuccessRedirect?: string | null;
  fetchBuildingsAction: (address: string) => Promise<BuildingOption[]>;
  submitAction: (
    payload: ReviewFormSubmitPayload,
  ) => Promise<ReviewFormSubmitResult>;
  initialValues?: Partial<ReviewFormValues>;
  initialAddress?: string;
  initialPostcode?: string | null;
  initialBuildingOptions?: BuildingOption[];
};

export function ReviewFormClient({
  heading = "리뷰 작성",
  steps = REVIEW_FORM_STEPS,
  mode = "create",
  submitLabel,
  successMessage = "리뷰가 저장되었습니다. 목록 페이지로 이동합니다.",
  onSuccessRedirect = "/reviews",
  fetchBuildingsAction,
  submitAction,
  initialValues,
  initialAddress,
  initialPostcode,
  initialBuildingOptions,
}: ReviewFormClientProps) {
  const router = useRouter();

  const mergedDefaultValues = useMemo(
    () => ({ ...DEFAULT_REVIEW_FORM_VALUES, ...initialValues }),
    [initialValues],
  );

  const [buildingOptions, setBuildingOptions] = useState<BuildingOption[]>(
    initialBuildingOptions ?? [],
  );
  const [address, setAddress] = useState(
    initialAddress ?? mergedDefaultValues.address ?? "",
  );
  const [postcode, setPostcode] = useState<string | undefined>(
    initialPostcode ?? mergedDefaultValues.postcode ?? undefined,
  );
  const [isAddressModalLoaded, setIsAddressModalLoaded] = useState(false);
  const [isLoadingAddressScript, setIsLoadingAddressScript] = useState(false);
  const [isFetchingBuildings, startFetchingBuildings] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const postcodeScriptPromiseRef = useRef<Promise<void> | null>(null);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema) as Resolver<ReviewFormValues>,
    defaultValues: mergedDefaultValues,
  });

  const rentType = form.watch("rentType");
  const selectedBuildingId = form.watch("buildingId");

  useEffect(() => {
    form.reset(mergedDefaultValues);
  }, [mergedDefaultValues, form]);

  useEffect(() => {
    if (!address) {
      setBuildingOptions([]);
      form.setValue("buildingId", "");
      return;
    }

    startFetchingBuildings(async () => {
      try {
        const results = await fetchBuildingsAction(address);
        setBuildingOptions(results);
        if (results.length === 0) {
          form.setValue("buildingId", "__new__");
          return;
        }

        const currentValue = form.getValues("buildingId");
        const hasCurrentSelection = currentValue
          ? results.some((option) => String(option.id) === String(currentValue))
          : false;

        if (!hasCurrentSelection) {
          form.setValue("buildingId", String(results[0].id));
        }
      } catch (error) {
        console.error(error);
        setBuildingOptions([]);
        form.setValue("buildingId", "__new__");
      }
    });
  }, [address, fetchBuildingsAction, form]);

  const ensurePostcodeScript = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (window.daum?.Postcode) {
      setIsAddressModalLoaded(true);
      return;
    }

    if (!postcodeScriptPromiseRef.current) {
      postcodeScriptPromiseRef.current = new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector(
          'script[src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"]',
        ) as HTMLScriptElement | null;
        const script = existingScript ?? document.createElement("script");
        if (!existingScript) {
          script.src =
            "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
          script.async = true;
        }
        script.onload = () => {
          setIsAddressModalLoaded(true);
          resolve();
        };
        script.onerror = () => {
          postcodeScriptPromiseRef.current = null;
          reject(new Error("Failed to load postcode script"));
        };
        if (!existingScript) {
          document.body.appendChild(script);
        } else if (window.daum?.Postcode) {
          setIsAddressModalLoaded(true);
          resolve();
        }
      });
    }

    await postcodeScriptPromiseRef.current;
  }, []);

  const handleOpenAddressSearch = useCallback(async () => {
    try {
      setFormError(null);
      if (!window.daum?.Postcode) {
        setIsLoadingAddressScript(true);
        await ensurePostcodeScript();
      }

      if (!window.daum?.Postcode) {
        throw new Error("Postcode script is not available");
      }

      new window.daum.Postcode({
        oncomplete: (data: KakaoPostcodeData) => {
          const selectedAddress =
            data.roadAddress || data.address || data.jibunAddress;
          setAddress(selectedAddress);
          setPostcode(data.zonecode || undefined);
          form.setValue("address", selectedAddress);
          form.setValue("postcode", data.zonecode || "");
        },
      }).open();
    } catch (error) {
      console.error(error);
      alert("주소 검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoadingAddressScript(false);
    }
  }, [ensurePostcodeScript, form]);

  const showNewBuildingInput =
    !buildingOptions.length ||
    selectedBuildingId === "__new__" ||
    !selectedBuildingId;

  const rentFieldLabels = useMemo(() => {
    switch (rentType) {
      case "월세":
        return { deposit: "보증금 (만원)", rent: "월세 (만원)" };
      case "전세":
        return { deposit: "전세 보증금 (만원)", rent: undefined };
      case "사글세":
        return {
          deposit: "사글세 보증금 (만원)",
          rent: "1년 사글세 금액 (만원)",
        };
      default:
        return { deposit: "보증금 (만원)", rent: "월세 (만원)" };
    }
  }, [rentType]);

  const parsePrice = (value: string | undefined | null) => {
    if (!value) return null;
    const trimmed = value.replace(/,/g, "").trim();
    if (trimmed.length === 0) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const validateCurrentStep = (values: ReviewFormValues): string | null => {
    switch (currentStep) {
      case 0: {
        if (!address) {
          return "주소를 먼저 검색해 선택해 주세요.";
        }
        const isNewBuilding =
          !buildingOptions.length ||
          selectedBuildingId === "__new__" ||
          !selectedBuildingId;
        if (isNewBuilding) {
          const newBuildingName = values.newBuildingName?.trim();
          if (!newBuildingName) {
            return "새 건물 이름을 입력해 주세요.";
          }
        } else if (!Number(values.buildingId)) {
          return "기존 건물을 선택해 주세요.";
        }
        return null;
      }
      case 1: {
        if (!values.moveAt) {
          return "입주 날짜를 입력해 주세요.";
        }
        const depositValue = parsePrice(values.deposit);
        const rentValue = parsePrice(values.rent);
        if (values.rentType === "월세") {
          if (depositValue === null || depositValue < 0) {
            return "월세 보증금을 올바르게 입력해 주세요.";
          }
          if (rentValue === null || rentValue <= 0) {
            return "월세 금액을 올바르게 입력해 주세요.";
          }
        }
        if (values.rentType === "전세") {
          if (depositValue === null || depositValue <= 0) {
            return "전세 보증금을 올바르게 입력해 주세요.";
          }
        }
        if (values.rentType === "사글세") {
          if (depositValue === null || depositValue <= 0) {
            return "사글세 보증금을 올바르게 입력해 주세요.";
          }
          if (rentValue === null || rentValue <= 0) {
            return "1년 사글세 금액을 올바르게 입력해 주세요.";
          }
        }
        return null;
      }
      case 2: {
        if (!values.score || values.score < 0.5) {
          return "평점을 선택해 주세요.";
        }
        if ((values.context ?? "").trim().length === 0) {
          return "리뷰 내용을 입력해 주세요.";
        }
        return null;
      }
      default:
        return null;
    }
  };

  const goToNextStep = (event?: ReactMouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    const values = form.getValues();
    const errorMessage = validateCurrentStep(values);
    if (errorMessage) {
      setFormError(errorMessage);
      return;
    }
    setFormError(null);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goToPrevStep = (event?: ReactMouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    setFormError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = form.handleSubmit((values: ReviewFormValues) => {
    setFormError(null);
    setSubmitSuccess(false);

    const finalValidation = validateCurrentStep(values);
    if (finalValidation) {
      setFormError(finalValidation);
      setCurrentStep((prev) => Math.min(prev, steps.length - 1));
      return;
    }

    const depositValue = parsePrice(values.deposit);
    const rentValue = parsePrice(values.rent);
    const isNewBuilding =
      !buildingOptions.length ||
      selectedBuildingId === "__new__" ||
      !selectedBuildingId;

    startSubmitting(async () => {
      const trimmedContext = values.context?.trim() ?? "";
      const payload: ReviewFormSubmitPayload = {
        address,
        postcode: postcode ?? null,
        buildingSelection: isNewBuilding
          ? { mode: "new", name: (values.newBuildingName ?? "").trim() }
          : { mode: "existing", buildingId: Number(values.buildingId) },
        rentType: values.rentType,
        deposit: depositValue,
        rent: rentValue,
        moveAt: values.moveAt,
        floor: values.floor?.trim() ? values.floor.trim() : null,
        score: values.score,
        context: trimmedContext.length > 0 ? trimmedContext : null,
      };

      const result = await submitAction(payload);

      if (!result.ok) {
        setFormError(result.message ?? "리뷰를 저장하지 못했습니다.");
        return;
      }

      setSubmitSuccess(true);

      if (mode === "create") {
        form.reset(DEFAULT_REVIEW_FORM_VALUES);
        setAddress(DEFAULT_REVIEW_FORM_VALUES.address);
        setPostcode(
          DEFAULT_REVIEW_FORM_VALUES.postcode
            ? DEFAULT_REVIEW_FORM_VALUES.postcode
            : undefined,
        );
        setBuildingOptions([]);
        setCurrentStep(0);
      } else {
        form.reset(mergedDefaultValues);
      }

      if (onSuccessRedirect) {
        router.push(onSuccessRedirect);
      }
    });
  });

  return (
    <>
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
        onLoad={() => setIsAddressModalLoaded(true)}
      />
      <Form {...form}>
        <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <header className="flex flex-col gap-4">
            <h1 className="text-foreground text-2xl font-semibold">{heading}</h1>
            <StepIndicator currentStep={currentStep} steps={steps} />
          </header>

          {currentStep === 0 ? (
            <section className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm">
              <div className="space-y-4">
                <FormField<ReviewFormValues>
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>주소</FormLabel>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <FormControl>
                          <Input
                            {...field}
                            value={address}
                            readOnly
                            placeholder="주소 검색 버튼을 눌러 주소를 입력하세요."
                          />
                        </FormControl>
                        <Button
                          type="button"
                          onClick={handleOpenAddressSearch}
                          disabled={
                            isSubmitting ||
                            (!isAddressModalLoaded && isLoadingAddressScript)
                          }
                          variant="outline"
                          className="sm:w-40"
                        >
                          {isLoadingAddressScript ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              불러오는 중...
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 size-4" />
                              주소 검색
                            </>
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Building className="text-muted-foreground size-4" />
                      <span className="text-sm font-medium text-foreground">건물 선택</span>
                    </div>
                    {isFetchingBuildings ? (
                      <p className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Loader2 className="size-4 animate-spin" />
                        건물 정보를 불러오는 중입니다...
                      </p>
                    ) : buildingOptions.length > 0 ? (
                      <FormField<ReviewFormValues>
                        control={form.control}
                        name="buildingId"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select
                                value={
                                  (field.value ??
                                    String(buildingOptions[0]?.id ?? "")) as string
                                }
                                onValueChange={(value) => field.onChange(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="건물을 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                  {buildingOptions.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>
                                      {option.name}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="__new__">새 건물 추가</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        이 주소로 등록된 건물이 없습니다. 새 건물 정보를 입력해 주세요.
                      </p>
                    )}
                  </div>
                  <FormField<ReviewFormValues>
                    control={form.control}
                    name="newBuildingName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>새 건물 이름</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="예: seof 하우스"
                            disabled={!showNewBuildingInput || isSubmitting}
                          />
                        </FormControl>
                        {showNewBuildingInput ? (
                          <p className="text-muted-foreground text-xs">
                            새로운 건물로 등록하려면 이름을 입력하세요.
                          </p>
                        ) : null}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </section>
          ) : null}

          {currentStep === 1 ? (
            <section className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField<ReviewFormValues>
                  control={form.control}
                  name="rentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>임대 방식</FormLabel>
                      <FormControl>
                        <Select
                          value={(field.value ?? RENT_TYPES[0]) as ReviewFormValues["rentType"]}
                          onValueChange={(value) => field.onChange(value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="임대 방식을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            {RENT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField<ReviewFormValues>
                  control={form.control}
                  name="moveAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>입주 날짜</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField<ReviewFormValues>
                  control={form.control}
                  name="deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{rentFieldLabels.deposit}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="예: 50"
                          inputMode="numeric"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {rentFieldLabels.rent ? (
                  <FormField<ReviewFormValues>
                    control={form.control}
                    name="rent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{rentFieldLabels.rent}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="예: 450"
                            inputMode="numeric"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>

              <FormField<ReviewFormValues>
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>거주 층수</FormLabel>
                    <FormControl>
                      <Select
                        value={(field.value ?? "지하") as string}
                        onValueChange={(value) => field.onChange(value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="거주 층수를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="반지하 이하">반지하 이하</SelectItem>
                          <SelectItem value="1층">1층</SelectItem>
                          <SelectItem value="2층">2층</SelectItem>
                          <SelectItem value="3층">3층</SelectItem>
                          <SelectItem value="4층">4층</SelectItem>
                          <SelectItem value="5층">5층</SelectItem>
                          <SelectItem value="6층 이상">6층 이상</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
          ) : null}

          {currentStep === 2 ? (
            <section className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField<ReviewFormValues>
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>평점</FormLabel>
                      <FormControl>
                        <StarRatingInput
                          value={
                            typeof field.value === "number"
                              ? field.value
                              : Number(field.value ?? DEFAULT_REVIEW_FORM_VALUES.score)
                          }
                          onChange={(value) => field.onChange(value)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField<ReviewFormValues>
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>리뷰 내용</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="거주하면서 느낀 점을 자유롭게 작성해 주세요."
                        rows={8}
                        maxLength={4000}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="text-muted-foreground text-xs text-right">
                      {String(field.value ?? "").length}/4000
                    </div>
                    <ul className="text-muted-foreground/80 mt-2 space-y-1 text-xs leading-relaxed">
                      <li>
                        규칙 위반 시 게시글이 삭제되고 사용자 계정이 정지될 수 있습니다. 작성 완료 시 아래
                        내용을 읽고 동의한 것으로 간주합니다.
                      </li>
                      <li>1. 타인의 권리를 침해하거나 불쾌감을 주는 표현 금지</li>
                      <li>2. 음란물, 부적절한 표현, 욕설, 비방 금지</li>
                      <li>3. 광고, 도배, 홍보 금지</li>
                      <li>4. 범죄, 불법 행위 등 법을 위반하는 행위 금지</li>
                      <li>5. 타인의 개인정보 노출 금지</li>
                    </ul>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
          ) : null}

          {steps.length > 3 && currentStep === 3 ? (
            <section className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm">
              <div>
                <h2 className="text-foreground text-lg font-semibold">작성 완료</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  아래 내용을 다시 한 번 확인한 뒤 <strong>{submitLabel ?? "작성 완료"}</strong>{" "}
                  버튼을 눌러 리뷰를 제출해 주세요.
                </p>
              </div>
              <div className="space-y-3 text-sm">
                <SummaryRow label="주소" value={address || "-"} />
                <SummaryRow
                  label="건물"
                  value={(() => {
                    if (showNewBuildingInput) {
                      return (form.getValues("newBuildingName") || "새 건물").trim() || "새 건물";
                    }
                    const found = buildingOptions.find(
                      (option) => String(option.id) === String(form.getValues("buildingId")),
                    );
                    return found?.name ?? "선택된 건물";
                  })()}
                />
                <SummaryRow label="임대 방식" value={form.getValues("rentType") || "-"} />
                <SummaryRow
                  label="보증금"
                  value={form.getValues("deposit") ? `${form.getValues("deposit")}만원` : "-"}
                />
                <SummaryRow
                  label="월세/사글세"
                  value={form.getValues("rent") ? `${form.getValues("rent")}만원` : "-"}
                />
                <SummaryRow label="입주 날짜" value={form.getValues("moveAt") || "-"} />
                <SummaryRow label="거주 층수" value={form.getValues("floor") || "-"} />
                {(() => {
                  const scoreValue = form.getValues("score");
                  return (
                    <SummaryRow
                      label="평점"
                      value={typeof scoreValue === "number" ? `${scoreValue.toFixed(1)}점` : "-"}
                    />
                  );
                })()}
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">
                    리뷰 내용
                  </span>
                  <p className="text-foreground mt-1 whitespace-pre-line break-words rounded-md bg-muted/40 p-3">
                    {(form.getValues("context") || "입력된 내용이 없습니다.").trim()}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {formError ? (
            <p className="text-destructive text-sm text-center">{formError}</p>
          ) : null}
          {submitSuccess ? (
            <p className="text-emerald-600 text-sm text-center">{successMessage}</p>
          ) : null}

          <div className="flex items-center justify-between">
            {currentStep > 0 ? (
              <Button type="button" variant="outline" onClick={goToPrevStep} disabled={isSubmitting}>
                이전
              </Button>
            ) : (
              <span />
            )}

            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={goToNextStep} disabled={isSubmitting}>
                다음
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  submitLabel ?? "작성 완료"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </>
  );
}

type SummaryRowProps = { label: string; value: string };

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border/60 bg-background/50 p-3">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

type StepIndicatorProps = {
  currentStep: number;
  steps: readonly string[];
};

function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`font-semibold tracking-wide ${
              index === currentStep ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="relative h-2 rounded-full bg-muted">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-primary transition-all"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

function StarRatingInput({ value, onChange, disabled = false }: StarRatingInputProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const safeValue = useMemo(() => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return 0.5;
    }
    return Math.min(5, Math.max(0.5, value));
  }, [value]);

  const updateValueFromPointer = useCallback(
    (event: PointerEvent | ReactPointerEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = event.clientX - rect.left;
      const ratio = Math.min(Math.max(x / rect.width, 0), 1);
      const raw = ratio * 5;
      let nextValue = Math.round(raw * 2) / 2;
      if (nextValue < 0.5) nextValue = 0.5;
      if (nextValue > 5) nextValue = 5;
      onChange(nextValue);
    },
    [onChange],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      containerRef.current?.setPointerCapture(event.pointerId);
      setIsDragging(true);
      updateValueFromPointer(event);
    },
    [disabled, updateValueFromPointer],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      event.preventDefault();
      containerRef.current?.releasePointerCapture(event.pointerId);
      setIsDragging(false);
    },
    [isDragging],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging || disabled) return;
      updateValueFromPointer(event);
    },
    [disabled, isDragging, updateValueFromPointer],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        onChange(Math.min(5, Math.round((safeValue + 0.5) * 2) / 2));
      } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        onChange(Math.max(0.5, Math.round((safeValue - 0.5) * 2) / 2));
      }
    },
    [disabled, onChange, safeValue],
  );

  const fillPercentage = (safeValue / 5) * 100;

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className={`relative inline-flex touch-none select-none ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        role="slider"
        aria-valuemin={0.5}
        aria-valuemax={5}
        aria-valuenow={safeValue}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerMove={handlePointerMove}
        onKeyDown={handleKeyDown}
      >
        <div className="flex gap-1 text-muted-foreground">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="size-8" />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0 flex gap-1 text-primary"
          style={{ clipPath: `inset(0 ${Math.max(0, 100 - fillPercentage)}% 0 0)` }}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="size-8 fill-current" />
          ))}
        </div>
      </div>
      <p className="text-muted-foreground text-xs">{safeValue.toFixed(1)}점 (0.5점 단위)</p>
    </div>
  );
}
