import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    background-color: #f5f5f5;
    overflow-x: hidden;
    
    /* 모바일 웹앱 느낌을 위한 스타일 */
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    user-select: none;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
    -webkit-tap-highlight-color: transparent;
  }

  input, textarea {
    font-family: inherit;
    border: none;
    outline: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* 스크롤바 스타일 */
  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }

  /* iOS 스타일 바운스 효과 제거 */
  body {
    overscroll-behavior-y: none;
  }
`;
