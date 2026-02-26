import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { login } from "../../api/auth";
import { setAccessToken } from "../../api/http";
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";
import splashLogo from "../../assets/icons/splash_logo.svg";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password });

      // accessToken 메모리 저장
      setAccessToken(res.accessToken);

      navigate("/home", { replace: true });
    } catch (err: any) {
      console.error("로그인 실패:", err);

      const isUnauthorized =
        err?.status === 401 || String(err?.message ?? "").includes("401");

      setErrorMsg(
        isUnauthorized
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : "로그인 중 오류가 발생했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ContentWrapper>
        <LogoIcon src={splashLogo} alt="MOMFIT" />
        <Card>
          <TabRow>
            <TabButtonWrapper>
              <Button variant="primary" size="long">
                로그인
              </Button>
            </TabButtonWrapper>

            <TabButtonWrapper>
              <Button
                variant="outlined"
                size="long"
                onClick={() => navigate("/auth/signup")}
              >
                회원가입
              </Button>
            </TabButtonWrapper>
          </TabRow>

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
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

            {errorMsg && <ErrorText>{errorMsg}</ErrorText>}

            <Button
              variant="primary"
              size="long"
              type="submit"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </Form>
        </Card>
      </ContentWrapper>
    </Screen>
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

const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  margin-top: -50px; /* 살짝 위로 */
`;

const LogoIcon = styled.img`
  width: 310px;
  height: 160px;
`;
