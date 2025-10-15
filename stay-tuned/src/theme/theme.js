// src/theme/theme.js
import { DefaultTheme } from 'react-native-paper';
import { typography } from './typography';

export const theme = {
    ...DefaultTheme,
    typography: typography,
    colors: {
        ...DefaultTheme.colors,
        primary: '#4361EE',
        secondary: '#3F37C9',
        accent: '#4CC9F0',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        text: '#212529',
        placeholder: '#6C757D',
        error: '#DC2F02',
        success: '#38B000',
        warning: '#FFAA00',
        info: '#3A86FF',
        card: '#FFFFFF',
        border: '#E9ECEF',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    roundness: 12,
    elevation: {
        small: 2,
        medium: 4,
        large: 8,
    },
};

export default theme;