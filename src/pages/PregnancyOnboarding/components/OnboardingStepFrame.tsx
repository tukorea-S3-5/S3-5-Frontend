import styled from "styled-components";
import type { ReactNode } from "react";
import InfoBox from "@/components/InfoBox";

type Props = {
  icon: ReactNode;
  title: string;
  subtitle: ReactNode;
  children: ReactNode; // 입력/선택 UI 영역
  helper?: ReactNode; // 참고 박스(선택)
};

export default function OnboardingStepFrame({
  icon,
  title,
  subtitle,
  children,
  helper,
}: Props) {
  return (
    <Wrap>
      <InfoBox icon={icon} title={title} subtitle={subtitle} />
      <Body>{children}</Body>
      {helper && <HelperArea>{helper}</HelperArea>}
    </Wrap>
  );
}

const Wrap = styled.div`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Body = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HelperArea = styled.div`
  width: 100%;
`;
