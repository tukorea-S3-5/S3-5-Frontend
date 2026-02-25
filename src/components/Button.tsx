import React from "react";
import styled from "styled-components";

interface ButtonProps {
  variant?: "filled" | "outlined" | "primary";
  size?: "short" | "long";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "short",
  children,
  onClick,
  disabled = false,
  icon,
  type = "button",
}) => {
  return (
    <StyledButton
      type={type}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <IconWrapper>{icon}</IconWrapper>}
      {children}
    </StyledButton>
  );
};

const StyledButton = styled.button<{ variant: string; size: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) => (props.size === "long" ? "width: 100%;" : "width: auto;")}
  ${(props) => (props.size === "short" ? "min-width: 140px;" : "")}
  
  ${(props) => {
    switch (props.variant) {
      case "filled":
        return `
          background: #FFE5E5;
          color: #FF6B6B;
          border: none;
          
          &:hover:not(:disabled) {
            background: #FFD4D4;
          }
        `;
      case "outlined":
        return `
          background: transparent;
          color: #FF6B6B;
          border: 1.5px solid #FF6B6B;
          
          &:hover:not(:disabled) {
            background: #FFF5F5;
          }
        `;
      case "primary":
        return `
          background: #FF6B6B;
          color: white;
          border: none;
          
          &:hover:not(:disabled) {
            background: #FF5252;
          }
        `;
      default:
        return "";
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
`;

export default Button;
