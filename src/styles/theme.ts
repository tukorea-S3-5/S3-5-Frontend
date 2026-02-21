export const theme = {
  colors: {
    primary: "#FF6B6B",
    secondary: "#FFE5E5",
    background: "#FFFFFF",
    light_background: "#FFF9F8",
    text: {
      primary: "#333333",
      secondary: "#666666",
      light: "#999999",
    },
    border: "#E0E0E0",
    error: "#FF4444",
    success: "#4CAF50",
    warning: "#FFA726",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },

  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    round: "50%",
  },

  fontSize: {
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "18px",
    xl: "20px",
    xxl: "24px",
    xxxl: "32px",
  },

  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  shadows: {
    sm: "0 2px 4px rgba(0, 0, 0, 0.1)",
    md: "0 4px 8px rgba(0, 0, 0, 0.1)",
    lg: "0 8px 16px rgba(0, 0, 0, 0.1)",
  },

  // 모바일 앱처럼 보이게 하기 위한 설정
  layout: {
    maxWidth: "480px",
    minHeight: "100vh",
  },
};

export type Theme = typeof theme;
