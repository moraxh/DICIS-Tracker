"use client";

import type { ThemeProviderProps as NextThemesProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type React from "react";

export interface ThemeProviderProps extends NextThemesProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider that uses next-themes with support for:
 * - Light, dark, and system themes
 * - prefers-color-scheme (respects the operating system preference)
 * - No flickering (anti-flash) when loading the page
 * - Persistence in localStorage
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  ...props
}) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      enableColorScheme={true}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
};

/**
 * Custom hook to retrieve and manage the current theme
 * We re-export `useTheme` from next-themes to maintain compatibility
 *
 * @returns Object containing theme properties and methods
 * @returns {string | undefined} theme - The theme selected by the user ('dark' | 'light' | 'system')
 * @returns {string | undefined} resolvedTheme - The currently applied theme ('dark' | 'light')
 * @returns {Function} setTheme - Function to change the theme
 * @returns {string[]} themes - Available theme options
 * @returns {string | undefined} systemTheme - The system-detected theme ('dark' | 'light')
 */

export { useTheme } from "next-themes";
