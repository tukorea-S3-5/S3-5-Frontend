import styled from "styled-components";
import Button from "@components/Button";

interface PregnancyEditModalProps {
  isOpen: boolean;
  preWeight: number;
  dueDate: string;
  isMultiple: boolean;
  isSaving?: boolean;

  onPreWeightChange: (value: number) => void;
  onDueDateChange: (value: string) => void;
  onIsMultipleChange: (value: boolean) => void;

  onClose: () => void;
  onSave: () => void;
}

export default function PregnancyEditModal({
  isOpen,
  preWeight,
  dueDate,
  isMultiple,
  isSaving = false,
  onPreWeightChange,
  onDueDateChange,
  onIsMultipleChange,
  onClose,
  onSave,
}: PregnancyEditModalProps) {
  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalBox>
        <Title>임신 정보 수정</Title>

        <Field>
          <Label>임신 전 체중 (kg)</Label>
          <Input
            type="number"
            value={preWeight}
            onChange={(e) => onPreWeightChange(Number(e.target.value))}
          />
        </Field>

        <Field>
          <Label>출산 예정일</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
          />
        </Field>

        <Field>
          <Label>다태아 여부</Label>

          <ToggleRow>
            <ToggleButton
              type="button"
              $selected={!isMultiple}
              onClick={() => onIsMultipleChange(false)}
            >
              단태아
            </ToggleButton>

            <ToggleButton
              type="button"
              $selected={isMultiple}
              onClick={() => onIsMultipleChange(true)}
            >
              다태아
            </ToggleButton>
          </ToggleRow>
        </Field>

        <ButtonRow>
          <Button variant="outlined" size="long" onClick={onClose}>
            취소
          </Button>

          <Button
            variant="primary"
            size="long"
            onClick={onSave}
            disabled={isSaving}
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
  justify-content: center;
  align-items: center;
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
  margin: 0 0 18px;
`;

const Field = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #f4c9c2;
  box-sizing: border-box;
`;

const ToggleRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ToggleButton = styled.button<{ $selected: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: ${({ $selected }) => ($selected ? "#FF6B6B" : "#FFE5E5")};
  color: ${({ $selected }) => ($selected ? "white" : "#FF6B6B")};
  cursor: pointer;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 24px;

  & > * {
    flex: 1;
  }
`;
