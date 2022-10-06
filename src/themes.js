'use strict';
import { getTheme as APIgetTheme, editTheme } from './routes/components/API';

export const themes = {
    light: 'light',
    dark: 'dark',
}

export const getTheme = () => {
    let theme = APIgetTheme();
    if (Object.values(themes).includes(theme.value)) return theme.value;

    const userMedia = window.matchMedia('(prefers-color-scheme: light)');
    if (userMedia.matches) return themes.light;

    return themes.light;
}