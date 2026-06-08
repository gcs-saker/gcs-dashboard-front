import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { LocalWebcamPublisher } from "./LocalWebcamPublisher";

describe("LocalWebcamPublisher", () => {
  test("shows an unsupported state when getUserMedia is unavailable", async () => {
    render(<LocalWebcamPublisher mediaDevices={undefined as unknown as MediaDevices} />);

    fireEvent.click(screen.getByRole("button", { name: "카메라 준비" }));

    expect(await screen.findByRole("status")).toHaveTextContent("지원 안 됨");
    expect(screen.getByText("이 브라우저에서는 카메라 캡처를 지원하지 않습니다.")).toBeInTheDocument();
  });

  test("starts preview and marks mock publishing complete without WHIP signaling", async () => {
    const track = { stop: vi.fn() } as unknown as MediaStreamTrack;
    const mediaStream = { getTracks: () => [track] } as unknown as MediaStream;
    const mediaDevices = {
      getUserMedia: vi.fn(async () => mediaStream),
    } as unknown as MediaDevices;
    const fetcher = vi.fn();

    render(
      <LocalWebcamPublisher
        fetcher={fetcher as unknown as typeof fetch}
        mediaDevices={mediaDevices}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "카메라 준비" }));
    expect(await screen.findByRole("status")).toHaveTextContent("미리보기 준비");

    fireEvent.click(screen.getByRole("button", { name: "시그널링 시작" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("송출 중"));
    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.getByText("목업 송출 상태로 전환되었습니다. 실제 WHIP 서버에는 연결하지 않습니다.")).toBeInTheDocument();
  });

  test("shows a clear error when camera permission is denied", async () => {
    const mediaDevices = {
      getUserMedia: vi.fn(async () => {
        throw new Error("Permission denied");
      }),
    } as unknown as MediaDevices;

    render(<LocalWebcamPublisher mediaDevices={mediaDevices} />);

    fireEvent.click(screen.getByRole("button", { name: "카메라 준비" }));

    expect(await screen.findByRole("status")).toHaveTextContent("오류");
    expect(screen.getByText("Permission denied")).toBeInTheDocument();
  });
});
