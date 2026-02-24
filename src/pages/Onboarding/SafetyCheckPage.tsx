import React, { useMemo, useState } from "react";
import styled from "styled-components";
import InfoBox from "../../components/InfoBox";
import Checkbox from "../../components/Checkbox";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

export default function SafetyCheckPage() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const checkboxLabel = useMemo(
    () => (
      <>
        (필수) 위 항목들을 모두 읽었으며, 어느 하나에도 해당하지 않음을
        확인합니다.
      </>
    ),
    [],
  );

  return (
    <InfoBox
      title="안전한 운동을 위해 꼭 확인해 주세요"
      subtitle={
        <>
          산모와 태아의 안전을 최우선으로 하기 위해,
          <br />
          다음 절대 금기 사항을 반드시 읽어주세요.
        </>
      }
    >
      <SectionTitle>
        <WarnIcon aria-hidden>⚠️</WarnIcon> 임신 중 운동을 절대 금지하는 경우
      </SectionTitle>

      <Block>
        <H3>1. 심장 및 폐 관련</H3>
        <Ul>
          <li>심각한 심장 질환이 있습니까?</li>
          <li>숨 쉬기 힘든 심각한 폐 질환이 있습니까?</li>
        </Ul>
      </Block>

      <Block>
        <H3>2. 자궁 및 태아 상태 관련</H3>
        <Ul>
          <li>자궁 경부가 약하거나, 자궁 입구를 묶는 수술을 하셨나요?</li>
          <li>
            세쌍둥이 이상이거나, 조산 위험이 있는 쌍둥이를 임신 중이신가요?
          </li>
          <li>(26주 이후) 태반이 자궁 입구를 막고 있다는 진단을 받으셨나요?</li>
        </Ul>
      </Block>

      <Block>
        <H3>3. 임신 합병증 및 위험 징후</H3>
        <Ul>
          <li>임신 중기 이후 지속적으로 피가 비치나요?</li>
          <li>양수가 터지거나 새고 있나요?</li>
          <li>규칙적인 배뭉침이나 조기 진통이 있나요?</li>
          <li>임신중독증(고혈압, 단백뇨 등) 진단을 받으셨나요?</li>
        </Ul>
      </Block>

      <Footer>
        <Checkbox checked={agreed} onChange={setAgreed} label={checkboxLabel} />
        <Button
          variant="outlined"
          size="long"
          disabled={!agreed}
          onClick={() => {
            navigate("/auth/login");
          }}
        >
          서비스 시작하기
        </Button>

        <Hint
          onClick={() => {
            navigate("/onboarding/expert");
          }}
        >
          혹시 해당하는 증상이 있으신가요?
        </Hint>
      </Footer>
    </InfoBox>
  );
}

const SectionTitle = styled.div`
  margin: 12px 0 14px;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.primary ?? "#FF6B6B"};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const WarnIcon = styled.span`
  font-size: 14px;
`;

const Block = styled.div`
  margin-top: 14px;
`;

const H3 = styled.div`
  font-weight: 700;
  margin-bottom: 6px;
  color: ${({ theme }) => theme?.colors?.text?.secondary ?? "#666"};
`;

const Ul = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: ${({ theme }) => theme?.colors?.text?.secondary ?? "#666"};

  li {
    margin: 6px 0;
  }
`;

const Footer = styled.div`
  margin-top: 16px;
  display: grid;
  gap: 10px;
`;

const Hint = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  text-align: center;
  text-decoration: underline;
  font-size: 12px;
  color: ${({ theme }) => theme?.colors?.text?.light ?? "#999"};
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: translateY(1px);
  }
`;
