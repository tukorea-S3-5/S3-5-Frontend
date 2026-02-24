import React from "react";
import styled from "styled-components";

export type InputBoxProps = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  disabled?: boolean;
  rightSlot?: React.ReactNode;
  name?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  maxLength?: number;
  enterKeyHint?: React.HTMLAttributes<HTMLInputElement>["enterKeyHint"];
};

export default function InputBox({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  disabled,
  rightSlot,
  inputMode,
  pattern,
  maxLength,
  enterKeyHint,
}: InputBoxProps) {
  return (
    <Wrap>
      {label && <Label>{label}</Label>}
      <Field>
        <Input
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          inputMode={inputMode}
          pattern={pattern}
          maxLength={maxLength}
          enterKeyHint={enterKeyHint}
          onChange={(e) => onChange(e.target.value)}
        />
        {rightSlot && <Right>{rightSlot}</Right>}
      </Field>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.div`
  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Field = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;

  /* 테두리 theme.colors.sub */
  border: 1px solid ${({ theme }) => theme.colors.sub};

  background: ${({ theme }) => theme.colors.white};
  outline: none;

  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.colors.text.primary};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.light};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.point};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Right = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
`;
