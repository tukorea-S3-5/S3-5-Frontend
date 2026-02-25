import styled from "styled-components";
import type { ReactNode } from "react";

type Option<T> = {
  value: T;
  title: ReactNode;
  description?: ReactNode;
};

type Props<T> = {
  value: T | undefined;
  options: Option<T>[];
  onChange: (v: T | undefined) => void;
  layout?: "row" | "column";
  allowDeselect?: boolean;
};

export default function ToggleButtonGroup<T>({
  value,
  options,
  onChange,
  layout = "row",
  allowDeselect = true,
}: Props<T>) {
  return (
    <Wrap $layout={layout}>
      {options.map((opt) => {
        const active = value === opt.value;

        return (
          <ChoiceButton
            key={String(opt.value)}
            type="button"
            $active={active}
            aria-pressed={active}
            onClick={() => {
              if (allowDeselect && active) onChange(undefined);
              else onChange(opt.value);
            }}
          >
            <Title>{opt.title}</Title>
            {opt.description && <Desc>{opt.description}</Desc>}
          </ChoiceButton>
        );
      })}
    </Wrap>
  );
}

const Wrap = styled.div<{ $layout: "row" | "column" }>`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-direction: ${({ $layout }) => ($layout === "row" ? "row" : "column")};
`;

const ChoiceButton = styled.button<{ $active: boolean }>`
  flex: 1;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  cursor: pointer;
  transition: all 0.2s ease;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;

  ${({ theme, $active }) =>
    $active
      ? `
        background: ${theme.colors.point};
        color: ${theme.colors.white};
        border: none;
      `
      : `
        background: ${theme.colors.white};
        color: ${theme.colors.text.secondary};
        border: 1px solid ${theme.colors.sub};
      `}

  &:hover:not(:disabled) {
    ${({ theme, $active }) =>
      $active ? `opacity: 0.95;` : `background: ${theme.colors.light};`}
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Title = styled.div`
  ${({ theme }) => theme.typography.heading3};
`;

const Desc = styled.div`
  ${({ theme }) => theme.typography.caption};
  opacity: 0.8;
`;
