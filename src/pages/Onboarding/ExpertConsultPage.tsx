import React from "react";
import styled from "styled-components";
import InfoBox from "../../components/InfoBox";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

export default function ExpertConsultPage() {
  const navigate = useNavigate();

  return (
    <InfoBox
      title="전문의 상담 안내"
      subtitle={
        <>
          본 서비스는 산모님과 태아의 안전을 최우선으로 합니다.
          <br />
          해당하시는 증상은 의학 가이드라인 기준 '운동 절대 금기 사항'에 포함될
          수 있습니다. 무리한 운동은 위험할 수 있으므로, 아쉽지만 본 맞춤형 운동
          서비스는 제공해 드리지 못하는 점 양해 부탁드립니다.
          <br />
          서비스를 종료하고 반드시 담당 주치의 선생님과 먼저 상담해 주세요!
        </>
      }
    >
      <Footer>
        <Button
          variant="outlined"
          size="long"
          onClick={() => {
            navigate("/");
          }}
        >
          처음으로 돌아가기
        </Button>
      </Footer>
    </InfoBox>
  );
}

const Footer = styled.div`
  margin-top: 16px;
  display: grid;
  gap: 10px;
`;
