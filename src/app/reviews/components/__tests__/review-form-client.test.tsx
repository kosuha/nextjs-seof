import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  vi,
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  type MockedFunction,
} from "vitest";
import { ReviewFormClient } from "../review-form-client";
import type { ReviewFormClientProps } from "../review-form-client";
import type { ReviewFormValues } from "../review-form-types";

vi.mock("next/script", () => ({
  default: function MockScript() {
    return null;
  },
}));

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const buildingOptions = [
  {
    id: 1,
    name: "테스트 하우스",
    address: "서울시 강남구 어딘가 1",
    postcode: "12345",
  },
];

const defaultInitialValues: Partial<ReviewFormValues> = {
  address: buildingOptions[0].address,
  postcode: buildingOptions[0].postcode ?? "",
  buildingId: String(buildingOptions[0].id),
  newBuildingName: "",
  rentType: "월세",
  deposit: "100",
  rent: "50",
  moveAt: "2024-01-01",
  floor: "3층",
  score: 4.5,
  context: "정말 괜찮았어요.",
};

type MockedFetchBuildings = MockedFunction<ReviewFormClientProps["fetchBuildingsAction"]>;
type MockedSubmitAction = MockedFunction<ReviewFormClientProps["submitAction"]>;

type RenderOptions = Partial<
  Omit<
    ReviewFormClientProps,
    "fetchBuildingsAction" | "submitAction" | "initialValues" | "initialAddress" | "initialPostcode" | "initialBuildingOptions"
  >
> & {
  fetchBuildingsAction?: MockedFetchBuildings;
  submitAction?: MockedSubmitAction;
  initialValues?: Partial<ReviewFormValues>;
  initialAddress?: string;
  initialPostcode?: string | null;
  initialBuildingOptions?: typeof buildingOptions;
};

function renderReviewForm(overrides: RenderOptions = {}) {
  const fetchBuildingsAction: MockedFetchBuildings =
    overrides.fetchBuildingsAction ??
    vi.fn<ReviewFormClientProps["fetchBuildingsAction"]>().mockResolvedValue(
      buildingOptions,
    );
  const submitAction: MockedSubmitAction =
    overrides.submitAction ??
    vi.fn<ReviewFormClientProps["submitAction"]>().mockResolvedValue({
      ok: true,
    });

  render(
    <ReviewFormClient
      heading="리뷰 수정"
      mode="edit"
      submitLabel="수정 완료"
      successMessage="리뷰가 수정되었습니다."
      onSuccessRedirect="/mypage"
      fetchBuildingsAction={fetchBuildingsAction}
      submitAction={submitAction}
      initialAddress={overrides.initialAddress ?? buildingOptions[0].address}
      initialPostcode={overrides.initialPostcode ?? buildingOptions[0].postcode}
      initialBuildingOptions={overrides.initialBuildingOptions ?? buildingOptions}
      initialValues={{ ...defaultInitialValues, ...overrides.initialValues }}
    />,
  );

  return { fetchBuildingsAction, submitAction };
}

describe("ReviewFormClient", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("progresses through steps and submits successfully", async () => {
    const { fetchBuildingsAction, submitAction } = renderReviewForm();
    const user = userEvent.setup();

    await waitFor(() => expect(fetchBuildingsAction).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "다음" }));
    await user.click(screen.getByRole("button", { name: "다음" }));

    await user.click(
      await screen.findByRole("button", { name: "수정 완료" }),
    );

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));

    expect(submitAction.mock.calls[0][0]).toMatchObject({
      address: buildingOptions[0].address,
      buildingSelection: { mode: "existing", buildingId: buildingOptions[0].id },
      rentType: "월세",
      deposit: 100,
      rent: 50,
      moveAt: "2024-01-01",
      score: 4.5,
      context: "정말 괜찮았어요.",
    });
    expect(pushMock).toHaveBeenCalledWith("/mypage");
  });

  it("shows validation error when review details are missing", async () => {
    const { fetchBuildingsAction, submitAction } = renderReviewForm({
      initialValues: {
        ...defaultInitialValues,
        context: "",
      },
    });
    const user = userEvent.setup();

    await waitFor(() => expect(fetchBuildingsAction).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "다음" }));
    await user.click(screen.getByRole("button", { name: "다음" }));

    await user.click(
      await screen.findByRole("button", { name: "수정 완료" }),
    );

    expect(
      await screen.findByText("리뷰 내용을 입력해 주세요."),
    ).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("surfaces submit errors from the server action", async () => {
    const submitAction = vi
      .fn<ReviewFormClientProps["submitAction"]>()
      .mockResolvedValue({ ok: false, message: "서버 오류" });

    const { fetchBuildingsAction } = renderReviewForm({ submitAction });
    const user = userEvent.setup();

    await waitFor(() => expect(fetchBuildingsAction).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "다음" }));
    await user.click(screen.getByRole("button", { name: "다음" }));
    await user.click(
      await screen.findByRole("button", { name: "수정 완료" }),
    );

    expect(await screen.findByText("서버 오류")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
