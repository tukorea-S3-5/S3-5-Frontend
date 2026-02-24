import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { signup } from "../../api/auth";
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";

export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birth_date, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignup = async () => {
    setErrorMsg(null);

    if (!email || !password || !name || !birth_date) {
      setErrorMsg("필수 항목을 모두 입력해 주세요.");
      return;
    }

    if (!isValidBirthDate(birth_date)) {
      setErrorMsg(
        "생년월일을 YYYY-MM-DD 형식으로 입력해 주세요. 예: 2003-01-02",
      );
      return;
    }

    try {
      setLoading(true);
      await signup({ email, password, name, birth_date });

      navigate("/auth/login", { replace: true });
    } catch (err: any) {
      console.error("회원가입 실패:", err);

      const isUnauthorized = err?.status === 400;

      setErrorMsg(
        isUnauthorized
          ? "이미 존재하는 이메일입니다."
          : "회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Card>
        {/* 탭 버튼 (항상 같은 크기) */}
        <TabRow>
          <TabButtonWrapper>
            <Button
              variant="outlined"
              size="long"
              onClick={() => navigate("/auth/login")}
            >
              로그인
            </Button>
          </TabButtonWrapper>

          <TabButtonWrapper>
            <Button variant="primary" size="long">
              회원가입
            </Button>
          </TabButtonWrapper>
        </TabRow>

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
          }}
        >
          <InputBox
            label="이메일"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="test@tukorea.ac.kr"
            autoComplete="email"
          />

          <InputBox
            label="비밀번호"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="비밀번호"
            autoComplete="current-password"
          />

          <InputBox
            label="이름"
            type="text"
            value={name}
            onChange={setName}
            placeholder="이름을 입력해 주세요"
            autoComplete="name"
          />

          <InputBox
            label="생년월일"
            type="text"
            value={birth_date}
            onChange={(v) => setBirthDate(formatBirth(v))}
            placeholder="YYYY-MM-DD"
            autoComplete="bday"
            inputMode="numeric"
            pattern="\d*"
            maxLength={10}
            enterKeyHint="done"
          />

          {errorMsg && <ErrorText>{errorMsg}</ErrorText>}

          <Button
            variant="primary"
            size="long"
            type="submit"
            disabled={loading}
          >
            {loading ? "회원가입 중..." : "회원가입"}
          </Button>
        </Form>
      </Card>
    </Screen>
  );
}

function formatBirth(input: string) {
  // 숫자만 남김
  const digits = input.replace(/\D/g, "").slice(0, 8); // YYYYMMDD
  const y = digits.slice(0, 4);
  const m = digits.slice(4, 6);
  const d = digits.slice(6, 8);

  if (digits.length <= 4) return y;
  if (digits.length <= 6) return `${y}-${m}`;
  return `${y}-${m}-${d}`;
}

// birth_date 검증 함수
function isValidBirthDate(value: string) {
  // YYYY-MM-DD 형태인지
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  // 실제 날짜인지(예: 2003-13-40 방지)
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(y, m - 1, d);

  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  );
}

const Screen = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 360px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 18px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const TabRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 18px;
`;

const TabButtonWrapper = styled.div`
  width: 100%;

  button {
    width: 100%;
    min-width: 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ErrorText = styled.div`
  ${({ theme }) => theme.typography.label};
  color: ${({ theme }) => theme.colors.point};
`;
