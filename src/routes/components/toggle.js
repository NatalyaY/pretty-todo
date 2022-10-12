'use strict';
import React from 'react';
import { editTheme } from '../helpers/API';
import { UserContext } from '../../userContext';


const themes = {
    light: 'light',
    dark: 'dark',
}

export const Toggle = () => {
    const { user } = React.useContext(UserContext);
    const darkThemeStart = user.theme.autoTheme?.darkTheme.start;
    const darkThemeEnd = user.theme.autoTheme?.darkTheme.end;
    const lightThemeStart = user.theme.autoTheme?.lightTheme.start;
    const lightThemeEnd = user.theme.autoTheme?.lightTheme.end;


    const getTheme = () => {
        let userTheme = user?.theme;
        let autoTheme = user?.theme?.autoTheme?.value;
        let theme, timeWhenChange;

        if (autoTheme) {
            if (!user.theme.autoTheme.lightTheme.end) {
                theme = themes.dark;
                timeWhenChange = null;
            } else if (!user.theme.autoTheme.darkTheme.end) {
                theme = themes.light;
                timeWhenChange = null;
            } else {
                const { lightTheme, darkTheme } = user.theme.autoTheme;
                lightTheme.type = 'light';
                darkTheme.type = 'dark';

                [lightTheme, darkTheme].forEach((set) => {
                    const dateNow = Date.now();
                    const endTime = set.end.split(':').map(el => Number(el));
                    const startTime = set.start.split(':').map(el => Number(el));

                    let endTimeTimestamp = new Date().setHours(endTime[0], endTime[1], 59, 999);
                    let startTimestamp = new Date().setHours(startTime[0], startTime[1], 0, 0);

                    if ((endTime[0] < startTime[0]) || ((endTime[0] == startTime[0]) && (endTime[1] < startTime[1]))) {
                        if (dateNow < startTimestamp) {
                            const yesterday = new Date().setDate(new Date().getDate() - 1);
                            startTimestamp = new Date(yesterday).setHours(startTime[0], startTime[1], 0, 0);
                        } else {
                            const tomorrow = new Date().setDate(new Date().getDate() + 1);
                            endTimeTimestamp = new Date(tomorrow).setHours(endTime[0], endTime[1], 59, 999);
                        };
                    };
                    if ((dateNow < endTimeTimestamp) && (dateNow >= startTimestamp)) {
                        theme = set.type == 'light' ? themes.light : themes.dark;
                        timeWhenChange = new Date(endTimeTimestamp).setMilliseconds(1000);
                    };
                });
            };
            return { theme, timeWhenChange };
        } else if (userTheme && Object.values(themes).includes(userTheme.value)) {
            theme = userTheme.value;
            timeWhenChange = null;
            return { theme, timeWhenChange };
        };

        const userMediaDark = window.matchMedia('(prefers-color-scheme: dark)');

        if (userMediaDark.matches) {
            theme = themes.dark;
            timeWhenChange = null;
            return { theme, timeWhenChange };
        } else {
            theme = themes.light;
            timeWhenChange = null;
            return { theme, timeWhenChange };
        };

    };

    const changeTheme = () => {
        const { theme, timeWhenChange } = getTheme();
        setAutoTheme(theme);
        setTimeToChange(timeWhenChange);
    };

    const [manualTheme, setManualTheme] = React.useState(null);
    const [autoTheme, setAutoTheme] = React.useState(null);
    const [timeToChange, setTimeToChange] = React.useState(null);
    const theme = manualTheme || autoTheme;

    React.useEffect(() => {
        if (!timeToChange) return;
        const timeout = timeToChange - new Date().getTime();
        const timer = setTimeout(changeTheme, timeout);
        return () => {
            clearTimeout(timer);
        };
    }, [autoTheme, timeToChange])

    React.useEffect(() => {
        changeTheme();
    }, [darkThemeStart, darkThemeEnd, lightThemeStart, lightThemeEnd])


    const isChecked = theme == themes.light ? true : false;
    const onChange = () => {
        const newTheme = theme == themes.light ? themes.dark : themes.light;
        document.documentElement.dataset.theme = newTheme;
        setManualTheme(newTheme);
        editTheme({ value: newTheme });
    };

    React.useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme])


    return (
        <label className='theme-toggle link--woUnderline' htmlFor="toggler">
            <input
                id="toggler"
                className='theme-toggle-checkbox'
                type="checkbox"
                onClick={onChange}
                defaultChecked={isChecked}
                hidden
            />
            <img src={isChecked ? '../img/moon.png' : '../img/sun.png'} alt="Тема" />
        </label>
    )
}


export default Toggle