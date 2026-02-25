import styled from "styled-components";

export default function LoadingOverlay() {
  return (
    <Overlay>
      <Spinner />
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #eee;
  border-top: 4px solid ${({ theme }) => theme.colors.point};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
