import React from 'react';
import styled from 'styled-components';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    icon,
    showCloseButton = true,
}) => {
    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                {showCloseButton && (
                    <CloseButton onClick={onClose}>✕</CloseButton>
                )}

                {icon && <IconWrapper>{icon}</IconWrapper>}

                {title && <ModalTitle>{title}</ModalTitle>}

                <ModalContent>{children}</ModalContent>
            </ModalContainer>
        </Overlay>
    );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  max-width: 400px;
  width: 100%;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 64px;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin: 0 0 16px 0;
  color: #333;
`;

const ModalContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  text-align: center;
`;

export default Modal;