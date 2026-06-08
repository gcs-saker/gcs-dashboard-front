import { useEffect, useMemo, useRef, useState } from "react";

import { LOCAL_WEBCAM_STREAM_ID } from "../../../config";
import "./LocalWebcamPublisher.css";

type WebcamPublisherStatus =
  | "idle"
  | "requesting-camera"
  | "previewing"
  | "published"
  | "error"
  | "unsupported";

type PublisherStepId = "camera" | "signaling" | "media";
type PublisherStepState = "pending" | "active" | "complete" | "error";

interface LocalWebcamPublisherProps {
  streamId?: string;
  mediaDevices?: MediaDevices;
  fetcher?: typeof fetch;
}

export function LocalWebcamPublisher({
  streamId = LOCAL_WEBCAM_STREAM_ID,
  mediaDevices = navigator.mediaDevices,
  fetcher = fetch,
}: LocalWebcamPublisherProps) {
  void fetcher;

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<WebcamPublisherStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedStep, setFailedStep] = useState<PublisherStepId | null>(null);
  const steps = useMemo(() => getPublisherSteps(status, failedStep), [failedStep, status]);

  useEffect(() => () => stopAll(), []);

  async function startPreview(): Promise<void> {
    if (!mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      setFailedStep("camera");
      setErrorMessage("이 브라우저에서는 카메라 캡처를 지원하지 않습니다.");
      return;
    }

    try {
      setFailedStep(null);
      setStatus("requesting-camera");
      const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setErrorMessage(null);
      setStatus("previewing");
    } catch (error) {
      setStatus("error");
      setFailedStep("camera");
      setErrorMessage(error instanceof Error ? error.message : "카메라 권한을 받을 수 없습니다.");
    }
  }

  async function publish(): Promise<void> {
    if (!streamRef.current) {
      setStatus("error");
      setFailedStep("camera");
      setErrorMessage("송출 전 카메라 미리보기를 먼저 준비해야 합니다.");
      return;
    }

    setFailedStep(null);
    setErrorMessage(null);
    setStatus("published");
  }

  function stopAll(): void {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
    setFailedStep(null);
  }

  return (
    <main className="local-webcam-publisher" aria-label="Local webcam mock publisher">
      <header className="local-webcam-publisher__header">
        <h1>로컬 웹캠 송출</h1>
        <span className="local-webcam-publisher__badge" role="status" aria-live="polite">
          {getStatusLabel(status)}
        </span>
        <span className="local-webcam-publisher__stream">{streamId}</span>
      </header>
      <ol className="local-webcam-publisher__steps" aria-label="목업 송출 단계">
        {steps.map((step) => (
          <li
            key={step.id}
            className={`local-webcam-publisher__step local-webcam-publisher__step--${step.state}`}
            aria-current={step.state === "active" ? "step" : undefined}
          >
            <span className="local-webcam-publisher__step-index">{step.index}</span>
            <span>{step.label}</span>
          </li>
        ))}
      </ol>
      <div className="local-webcam-publisher__controls">
        <button type="button" onClick={() => void startPreview()} disabled={isBusy(status) || status === "published"}>
          카메라 준비
        </button>
        <button type="button" onClick={() => void publish()} disabled={status !== "previewing"}>
          시그널링 시작
        </button>
        <button type="button" onClick={stopAll}>
          중지
        </button>
      </div>
      <video ref={videoRef} className="local-webcam-publisher__video" aria-label="Local camera preview" autoPlay muted playsInline />
      <p className="local-webcam-publisher__status-detail" aria-live="polite">
        {getStatusDetail(status)}
      </p>
      {errorMessage ? <p className="local-webcam-publisher__error">{errorMessage}</p> : null}
    </main>
  );
}

export default LocalWebcamPublisher;

function isBusy(status: WebcamPublisherStatus): boolean {
  return status === "requesting-camera";
}

function getStatusLabel(status: WebcamPublisherStatus): string {
  const labels: Record<WebcamPublisherStatus, string> = {
    idle: "대기",
    "requesting-camera": "카메라 권한 요청",
    previewing: "미리보기 준비",
    published: "송출 중",
    error: "오류",
    unsupported: "지원 안 됨",
  };
  return labels[status];
}

function getStatusDetail(status: WebcamPublisherStatus): string {
  const details: Record<WebcamPublisherStatus, string> = {
    idle: "카메라를 준비하면 목업 송출 단계를 확인할 수 있습니다.",
    "requesting-camera": "브라우저 카메라와 마이크 권한을 요청하고 있습니다.",
    previewing: "카메라 미리보기가 준비됐습니다. 목업 시그널링을 시작할 수 있습니다.",
    published: "목업 송출 상태로 전환되었습니다. 실제 WHIP 서버에는 연결하지 않습니다.",
    error: "오류 내용을 확인한 뒤 다시 시도할 수 있습니다.",
    unsupported: "현재 브라우저 환경에서는 로컬 카메라 캡처를 지원하지 않습니다.",
  };
  return details[status];
}

function getPublisherSteps(status: WebcamPublisherStatus, failedStep: PublisherStepId | null): Array<{
  id: PublisherStepId;
  index: number;
  label: string;
  state: PublisherStepState;
}> {
  const order: PublisherStepId[] = ["camera", "signaling", "media"];
  const labels: Record<PublisherStepId, string> = {
    camera: "카메라 준비",
    signaling: "목업 시그널링",
    media: "목업 미디어 연결",
  };
  const activeStepByStatus: Partial<Record<WebcamPublisherStatus, PublisherStepId>> = {
    "requesting-camera": "camera",
    previewing: "camera",
    published: "media",
  };
  const activeStep = status === "error" ? failedStep : activeStepByStatus[status];
  const activeIndex = activeStep ? order.indexOf(activeStep) : -1;

  return order.map((id, index) => ({
    id,
    index: index + 1,
    label: labels[id],
    state: getPublisherStepState(status, index, activeIndex),
  }));
}

function getPublisherStepState(status: WebcamPublisherStatus, index: number, activeIndex: number): PublisherStepState {
  if (status === "error") {
    return index === Math.max(activeIndex, 0) ? "error" : index < Math.max(activeIndex, 0) ? "complete" : "pending";
  }
  if (status === "published") {
    return "complete";
  }
  if (activeIndex === -1) {
    return "pending";
  }
  if (index < activeIndex || status === "previewing") {
    return "complete";
  }
  if (index === activeIndex) {
    return "active";
  }
  return "pending";
}
