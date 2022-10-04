'use strict';
import React from 'react';
import { themes, getTheme } from '../../themes';


export const Toggle = () => {
    const [theme, setTheme] = React.useState(getTheme());
    const isChecked = theme == themes.light ? true : false;
    const onChange = () => {
        theme == themes.light ? setTheme(themes.dark) : setTheme(themes.light);
    };

    React.useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme)
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