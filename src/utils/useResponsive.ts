import { Platform, useWindowDimensions } from 'react-native';

// Breakpoints for the web build. Native always gets the phone layout
// (Decision 013: desktop web gets a desktop layout; phones get the phone UI).
export const DESKTOP_BREAKPOINT = 900;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= DESKTOP_BREAKPOINT;
  return { width, height, isWeb, isDesktop };
}
