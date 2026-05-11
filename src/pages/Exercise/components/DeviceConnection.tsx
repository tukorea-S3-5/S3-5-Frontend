import Modal from "@components/Modal";
import { useEffect, useState } from "react";
import PowerIcon from "@assets/icons/power.svg";
import BluetoothIcon from "@assets/icons/bluetooth.svg";
import LoadingIcon from "@assets/icons/loading.svg";

type ConnectionStep = "power" | "bluetooth" | "connecting";

interface DeviceConnectionFlowProps {
  isOpen: boolean;
  onConnect?: () => Promise<void>;
  onConnected: () => void;
  onCancel: () => void;
}

const STEPS: Record<
  ConnectionStep,
  { icon: React.ReactNode; message: string }
> = {
  power: {
    icon: <img src={PowerIcon} width={64} height={64} alt="전원" />,
    message: "운동을 시작하려면 웨어러블 기기 연결이 필요합니다",
  },
  bluetooth: {
    icon: <img src={BluetoothIcon} width={64} height={64} alt="블루투스" />,
    message: "블루투스를 활성화하고 기기를 선택해주세요",
  },
  connecting: {
    icon: (
      <img
        src={LoadingIcon}
        width={64}
        height={64}
        alt="연결 중"
        style={{ animation: "dcf-spin 1.2s linear infinite" }}
      />
    ),
    message: "기기 연결 중입니다...",
  },
};

export default function DeviceConnection({
  isOpen,
  onConnect,
  onConnected,
  onCancel,
}: DeviceConnectionFlowProps) {
  const [step, setStep] = useState<ConnectionStep>("power");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep("power");
      setErrorMessage("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || step !== "connecting") return;

    let cancelled = false;

    const connect =
      onConnect ?? (() => new Promise<void>((res) => setTimeout(res, 3000)));

    connect()
      .then(() => {
        if (!cancelled) onConnected();
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("블루투스 연결 실패:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "블루투스 연결에 실패했습니다.",
        );
        setStep("bluetooth");
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, step, onConnect, onConnected]);

  const current = STEPS[step];
  const isConnecting = step === "connecting";

  return (
    <>
      <style>{`
        @keyframes dcf-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <Modal
        isOpen={isOpen}
        onClose={isConnecting ? () => {} : onCancel}
        icon={current.icon}
        showCloseButton={false}
      >
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#1a1a1a",
            margin: "8px 0 0",
          }}
        >
          {current.message}
        </p>

        {errorMessage && (
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#FF5038",
              margin: "12px 0 0",
              textAlign: "center",
            }}
          >
            {errorMessage}
          </p>
        )}

        {!isConnecting && (
          <button
            onClick={() =>
              setStep(step === "power" ? "bluetooth" : "connecting")
            }
            style={{
              marginTop: 24,
              width: "100%",
              padding: "14px",
              background: "#FF5038",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              border: "1px solid #FF5038",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            {step === "power" ? "확인했어요" : "연결 시작"}
          </button>
        )}
      </Modal>
    </>
  );
}
