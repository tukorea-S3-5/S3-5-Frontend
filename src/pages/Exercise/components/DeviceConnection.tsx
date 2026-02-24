import Modal from '@components/Modal';
import { useEffect, useState } from 'react';
import PowerIcon from '@assets/icons/power.svg';
import BluetoothIcon from '@assets/icons/Bluetooth.svg';
import LoadingIcon from '@assets/icons/loading.svg';

type ConnectionStep = 'power' | 'bluetooth' | 'connecting';

interface DeviceConnectionFlowProps {
  isOpen: boolean;
  onConnect?: () => Promise<void>;
  onConnected: () => void;
  onCancel: () => void;
}

const STEPS: Record<ConnectionStep, { icon: React.ReactNode; message: string }> = {
  power: {
    icon: <img src={PowerIcon} width={64} height={64} alt="전원" />,
    message: '스마트워치의 전원을 켜주세요',
  },
  bluetooth: {
    icon: <img src={BluetoothIcon} width={64} height={64} alt="블루투스" />,
    message: '블루투스 연결을 확인해주세요',
  },
  connecting: {
    icon: <img src={LoadingIcon} width={64} height={64} alt="연결 중" style={{ animation: 'dcf-pulse 1.8s ease-in-out infinite' }} />,
    message: '연결 중...',
  },
};

export default function DeviceConnection({
  isOpen,
  onConnect,
  onConnected,
  onCancel,
}: DeviceConnectionFlowProps) {
  const [step, setStep] = useState<ConnectionStep>('power');

  useEffect(() => {
    if (isOpen) setStep('power');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || step !== 'connecting') return;

    const connect = onConnect ?? (() => new Promise<void>((res) => setTimeout(res, 3000)));
    connect().then(onConnected);
  }, [isOpen, step, onConnect, onConnected]);

  const current = STEPS[step];
  const isConnecting = step === 'connecting';

  return (
    <>
      <style>{`
        @keyframes dcf-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.1); opacity: 0.7; }
        }
      `}</style>

      <Modal
        isOpen={isOpen}
        onClose={isConnecting ? () => { } : onCancel}
        icon={current.icon}
        showCloseButton={false}
      >
        <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '8px 0 0' }}>
          {current.message}
        </p>

        {!isConnecting && (
          <button
            onClick={() => setStep(step === 'power' ? 'bluetooth' : 'connecting')}
            style={{
              marginTop: 24,
              width: '100%',
              padding: '14px',
              background: '#FF5038',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              border: '1px solid `#FF5038`',
              borderRadius: 12,
              cursor: 'pointer',
            }}
          >
            {step === 'power' ? '확인했어요' : '연결 시작'}
          </button>
        )}
      </Modal>
    </>
  );
}