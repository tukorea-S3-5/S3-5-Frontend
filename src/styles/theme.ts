import { css } from 'styled-components';

const fontFamily = `'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif`;

export const theme = {
  colors: {
    // ── 디자인 시스템 컬러 ──────────────────
    point:      '#FF3B30',   // 포인트 레드
    middle:     '#FFBCB5',   // 미들 핑크
    light:      '#FFE8E5',   // 라이트 핑크
    sub:        '#FFD6D0',   // 서브 핑크
    blue:       '#C2E0FF',   // 블루
    background: '#FFF5F3',   // 배경
    white:      '#FFFFFF',
    subtext:    '#6B6B6B',   // 보조 텍스트

    // ── 기존 토큰 (하위 호환) ───────────────
    primary:    '#FF6B6B',
    secondary:  '#FFE5E5',
    text: {
      primary:   '#333333',
      secondary: '#666666',
      light:     '#999999',
    },
    border:  '#E0E0E0',
    error:   '#FF4444',
    success: '#4CAF50',
    warning: '#FFA726',
  },

  // ── 타이포그래피 ────────────────────────────
  fontFamily,

  fontWeight: {
    light:    300,   // AppleSDGothicNeoL00
    regular:  400,
    medium:   500,   // AppleSDGothicNeoM00
    semibold: 600,   // AppleSDGothicNeoSB00
    bold:     700,   // AppleSDGothicNeoB00
    heavy:    800,   // AppleSDGothicNeoH00
  },

  fontSize: {
    xs:   '12px',
    sm:   '14px',
    md:   '16px',
    lg:   '18px',
    xl:   '20px',
    xxl:  '24px',
    xxxl: '32px',
  },

  // 자주 쓰는 텍스트 스타일 조합 — css`` 스프레드로 바로 사용
  // 예: const Title = styled.h1`${({ theme }) => theme.typography.heading1}`
  typography: {
    heading1: css`
      font-family: ${fontFamily};
      font-size: 24px;
      font-weight: 800;
      line-height: 1.3;
      letter-spacing: -0.3px;
    `,
    heading2: css`
      font-family: ${fontFamily};
      font-size: 20px;
      font-weight: 700;
      line-height: 1.35;
      letter-spacing: -0.2px;
    `,
    heading3: css`
      font-family: ${fontFamily};
      font-size: 17px;
      font-weight: 600;
      line-height: 1.4;
      letter-spacing: -0.2px;
    `,
    body1: css`
      font-family: ${fontFamily};
      font-size: 15px;
      font-weight: 500;
      line-height: 1.6;
      letter-spacing: -0.1px;
    `,
    body2: css`
      font-family: ${fontFamily};
      font-size: 14px;
      font-weight: 400;
      line-height: 1.6;
      letter-spacing: -0.1px;
    `,
    caption: css`
      font-family: ${fontFamily};
      font-size: 12px;
      font-weight: 400;
      line-height: 1.5;
    `,
    button: css`
      font-family: ${fontFamily};
      font-size: 16px;
      font-weight: 600;
      line-height: 1;
      letter-spacing: -0.1px;
    `,
    label: css`
      font-family: ${fontFamily};
      font-size: 13px;
      font-weight: 500;
      line-height: 1;
    `,
  },

  // ── 간격 (기존 유지) ────────────────────────
  spacing: {
    xs:  '4px',
    sm:  '8px',
    md:  '16px',
    lg:  '24px',
    xl:  '32px',
    xxl: '48px',
  },

  // ── 보더 라디우스 (기존 유지) ───────────────
  borderRadius: {
    sm:    '8px',
    md:    '12px',
    lg:    '16px',
    xl:    '24px',
    round: '50%',
    full:  '9999px',
  },

  // ── 그림자 (기존 유지) ──────────────────────
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },

  // ── 레이아웃 (기존 유지) ────────────────────
  layout: {
    maxWidth:  '480px',
    minHeight: '100vh',
  },
};

export type Theme = typeof theme;
