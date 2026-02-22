import React from "react";
import styled from "styled-components";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
}: CheckboxProps) {
  return (
    <Label $disabled={disabled}>
      <HiddenInput
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Box aria-hidden="true" $checked={checked} $disabled={disabled} />
      {label && <Text $checked={checked}>{label}</Text>}
    </Label>
  );
}

const Label = styled.label<{ $disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  user-select: none;
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const Box = styled.span<{ $checked: boolean; $disabled: boolean }>`
  width: 20px;
  height: 20px;
  min-width: 18px;
  min-height: 18px;
  flex: 0 0 18px;
  border-radius: 5px;
  border: 1.5px solid
    ${({ theme, $disabled }) =>
      $disabled ? theme.colors.border : theme.colors.middle};
  background: ${({ $checked, theme }) =>
    $checked ? theme.colors.primary : "transparent"};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &::after {
    content: "";
    width: 8px;
    height: 4px;
    border: 2px solid ${({ theme }) => theme.colors.white};
    border-top: none;
    border-right: none;
    transform: translateY(-1px) rotate(-45deg);
    opacity: ${({ $checked }) => ($checked ? 1 : 0)};
    transition: opacity 0.15s;
  }
`;

const Text = styled.span<{ $checked: boolean }>`
  ${({ theme }) => theme.typography.label};
  color: ${({ theme, $checked }) =>
    $checked ? theme.colors.text.secondary : theme.colors.text.light};
  transition: color 0.15s ease;
`;
