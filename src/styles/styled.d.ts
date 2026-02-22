import 'styled-components';
import { Theme } from './theme';

type ThemeType = typeof theme;

declare module 'styled-components' {
  export interface DefaultTheme extends Theme { }
}
