export const lightColors = {
  primary: '#6200ee',
  secondary: '#03dac6',
  background: '#ffffff',
  surface: '#ffffff',
  error: '#b00020',
  text: '#000000',
  onBackground: '#000000',
  onSurface: '#000000',
  disabled: '#9e9e9e',
  placeholder: '#9e9e9e',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#f50057',
  border: '#e0e0e0',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',
};

export const darkColors = {
  primary: '#bb86fc',
  secondary: '#03dac6',
  background: '#121212',
  surface: '#1e1e1e',
  error: '#cf6679',
  text: '#ffffff',
  onBackground: '#ffffff',
  onSurface: '#ffffff',
  disabled: '#6c6c6c',
  placeholder: '#9e9e9e',
  backdrop: 'rgba(0, 0, 0, 0.8)',
  notification: '#ff4081',
  border: '#3a3a3a',
  success: '#66bb6a',
  warning: '#ffb74d',
  info: '#64b5f6',
};

export const colors = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ThemeColors = typeof lightColors;

export default colors;
