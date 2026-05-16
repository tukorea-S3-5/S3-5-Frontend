import styled from "styled-components";
import Button from "@components/Button";

interface NameEditModalProps {
  isOpen: boolean;
  value: string;
  isSaving?: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function NameEditModal({
  isOpen,
  value,
  isSaving = false,
  onChange,
  onClose,
  onSave,
}: NameEditModalProps) {
  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalBox>
        <Title>이름 수정</Title>

        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="이름을 입력하세요"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
          }}
        />

        <ButtonRow>
          <Button variant="outlined" size="long" onClick={onClose}>
            취소
          </Button>

          <Button
            variant="primary"
            size="long"
            onClick={onSave}
            disabled={!value.trim() || isSaving}
          >
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </ButtonRow>
      </ModalBox>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalBox = styled.div`
  width: calc(100% - 48px);
  max-width: 360px;
  background: white;
  border-radius: 18px;
  padding: 22px 18px;
`;

const Title = styled.h3`
  margin: 0 0 14px;
  font-size: 18px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #f4c9c2;
  border-radius: 10px;
  box-sizing: border-box;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 24px;
  & > * {
    flex: 1;
  }
`;
