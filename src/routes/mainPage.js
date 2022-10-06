'use strict';
import React, { Fragment } from 'react';
import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';
import Flatpickr from "react-flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js";
import "flatpickr/dist/flatpickr.min.css";
import { UserContext } from '../userContext';
import withModal from './components/modal';
import { getTheme as APIgetTheme, editTheme } from './components/API';


export default function Main() {
    const { user, saveUser } = React.useContext(UserContext);
    const name = (user.name && user.name != ' ') ? user.name : 'Гость';

    const getGreetingsAndTime = () => {
        const time = new Date().getHours();
        let greetingsText, timeWhenChange;
        if (time < 5) {
            greetingsText = 'Доброй ночи';
            timeWhenChange = new Date().setHours(5, 0, 0, 0);
        } else if (time < 11) {
            greetingsText = 'Доброе утро';
            timeWhenChange = new Date().setHours(11, 0, 0, 0);
        } else if (time < 18) {
            greetingsText = 'Добрый день';
            timeWhenChange = new Date().setHours(18, 0, 0, 0);
        } else {
            greetingsText = 'Добрый вечер';
            timeWhenChange = new Date().setHours(23, 59, 59, 1000);
        };
        return {greetingsText, timeWhenChange};
    };

    const changeGreetings = () => {
        setGreetings(getGreetingsAndTime().greetingsText);
        setTimeToChange(getGreetingsAndTime().timeWhenChange);
    };

    const [greetings, setGreetings] = React.useState(getGreetingsAndTime().greetingsText);
    const [timeToChange, setTimeToChange] = React.useState(getGreetingsAndTime().timeWhenChange);


    React.useEffect(() => {
        const timeout = timeToChange - new Date().getTime();
        const timer = setTimeout(changeGreetings, timeout);
        return () => {
            clearTimeout(timer);
        };
    }, [greetings, timeToChange])


    return (
        <section>
            <div className="container mainPageContainer">
                <div className="card">
                    <h1>{`${greetings}, ${name}!`}</h1>
                </div>
                <section className='editForm-contentGroup editForm-contentGroup--row align-start'>
                    <div className="card flex1">
                        <UserData user={user} saveUser={saveUser} />
                    </div>
                    <div className="card flex1">
                    </div>
                </section>
            </div>
        </section>
    )
}


function UserData(props) {
    const [preview, setPreview] = React.useState(null);
    const [name, setName] = React.useState(props.user.name || '');
    const [filetype, setFileType] = React.useState('');
    const [errmessage, setErrmessage] = React.useState('');
    const [submitDisabled, setSubmitDisabled] = React.useState(true);


    const theme = APIgetTheme();
    const [autoTheme, setAutoTheme] = React.useState(theme?.autoTheme || {});

    const onChangeImg = (e) => {
        if (e.target.files.length && e.target.files[0].type.split("/")[0] == "image") {
            setPreview(window.URL.createObjectURL(e.target.files[0]));
            setSubmitDisabled(false);
            setFileType(e.target.files[0].type);
        };
    };

    const resizeAndReturnDataURL = async () => {
        const image = document.createElement("img");
        image.src = preview;
        return new Promise((resolve, reject) => {
            image.onload = () => {
                const maxWidth = 400;
                const maxHeight = 400;
                if (image.width > maxWidth || image.height > maxHeight) {
                    const aspectRatio = image.width / image.height;
                    if (image.height > image.width) {
                        image.width = maxWidth;
                        image.height = maxWidth / aspectRatio;
                    } else {
                        image.height = maxHeight;
                        image.width = maxHeight * aspectRatio;
                    };
                };
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                const result = canvas.toDataURL(filetype);
                resolve(result);
            };
            image.onerror = reject;
        });

    };

    const onSubmit = async () => {
        let newUser = { name };

        if (preview) {
            try {
                newUser.avatar = await resizeAndReturnDataURL();
            } catch (err) {
                setErrmessage('Ошибка загрузки аватара, повторите позже');
            };
        };

        if (Object.keys(newUser).length) {
            props.saveUser(newUser);
        };

        if (Object.keys(autoTheme).length) {
            let theme = {
                ...theme,
                autoTheme,
            };
            editTheme(theme);
        };
        setPreview(null);
        setSubmitDisabled(true);
    };

    return (
        <div className='editForm-contentGroup editForm-contentGroup--row align-start'>
            <label className='editForm-contentGroup editForm-contentGroup--col'>
                <div className="userImgWrap userImgWrap--main">
                    {
                        props.user.avatar || preview ? <img className="userImg" src={preview || props.user.avatar} alt="" /> :
                            <svg className="userImg"><use href="../img/user.svg#avatarDefault" /></svg>
                    }
                </div>
                <span className='userAddImgLink link'>{props.user.img ? 'изменить фото' : 'добавить фото'}</span>
                <input
                    type="file"
                    onChange={onChangeImg}
                    name='img'
                    hidden
                />
            </label>
            <div className="editForm-contentGroup editForm-contentGroup--col">
                <label className='editForm-contentGroup editForm-contentGroup--col align-s-stretch'>
                    <span>Ваш никнейм:</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            if ((props.user.name || '') != e.target.value) {
                                setSubmitDisabled(false);
                            } else if ((props.user.name || '').length == e.target.value.length == 0) {
                                setSubmitDisabled(true);
                            } else {
                                setSubmitDisabled(true);
                            };
                            setName(e.target.value);
                        }}
                        placeholder='Гость'
                        name='name'
                    />
                </label>
                <AutoTheme themeFromAPI={theme} autoTheme={autoTheme} setAutoTheme={setAutoTheme} setSubmitDisabled={setSubmitDisabled} />
                <div className="inputWrap userDataBtn">
                    <button onClick={onSubmit} className='btn btn--colored addBtn' disabled={submitDisabled ? true : null}>Сохранить изменения</button>
                    {
                        errmessage && <ModalErrmessage message={errmessage} callback={() => setErrmessage(null)} />
                    }
                </div>
            </div>
        </div>
    )
}


function AutoTheme({ themeFromAPI, autoTheme, setAutoTheme, setSubmitDisabled }) {

    const date = new Date();
    let { start: darkStart, end: darkEnd } = autoTheme?.darkTheme || { start: null, end: null };
    let { start: lightStart, end: lightEnd } = autoTheme?.lightTheme || { start: null, end: null };

    darkStart = darkStart ? new Date(date.setHours(darkStart.split(':')[0], darkStart.split(':')[1], 0, 0)) : new Date(date.setHours(18, 0, 0));
    darkEnd = darkEnd ? new Date(date.setHours(darkEnd.split(':')[0], darkEnd.split(':')[1], 0, 0)) : new Date(date.setHours(5, 59, 0));
    lightStart = lightStart ? new Date(date.setHours(lightStart.split(':')[0], lightStart.split(':')[1], 0, 0)) : new Date(date.setHours(6, 0, 0));
    lightEnd = lightEnd ? new Date(date.setHours(lightEnd.split(':')[0], lightEnd.split(':')[1], 0, 0)) : new Date(date.setHours(17, 59, 0));

    const [darkThemeStart, setDarkThemeStart] = React.useState(darkStart);
    const [darkThemeEnd, setDarkThemeEnd] = React.useState(darkEnd);
    const [lightThemeStart, setLightThemeStart] = React.useState(lightStart);
    const [lightThemeEnd, setLightThemeEnd] = React.useState(lightEnd);
    const autoThemeRef = React.useRef();

    const themeObj = {
        value: autoTheme?.value,
        darkTheme: {
            start: `${darkThemeStart.getHours()}:${darkThemeStart.getMinutes()}`,
            end: `${darkThemeEnd.getHours()}:${darkThemeEnd.getMinutes()}`,
        },
        lightTheme: {
            start: `${lightThemeStart.getHours()}:${lightThemeStart.getMinutes()}`,
            end: `${lightThemeEnd.getHours()}:${lightThemeEnd.getMinutes()}`,
        },
    }

    const changeOtherThemeTimes = ({ theme, timeType, date }) => {
        let thisThemeStartTime, thisThemeEndTime, otherThemeStartSetter, otherThemeEndSetter, otherTheme;
        if (theme == "light") {
            if (timeType == "start") {
                thisThemeStartTime = date;
                themeObj.lightTheme.start = `${date.getHours()}:${date.getMinutes()}`;
                thisThemeEndTime = lightThemeEnd;
            } else {
                thisThemeStartTime = lightThemeStart;
                thisThemeEndTime = date;
                themeObj.lightTheme.end = `${date.getHours()}:${date.getMinutes()}`;
            };
            otherThemeStartSetter = setDarkThemeStart;
            otherThemeEndSetter = setDarkThemeEnd;
            otherTheme = 'darkTheme';
        } else {
            if (timeType == "start") {
                thisThemeStartTime = date;
                thisThemeEndTime = darkThemeEnd;
                themeObj.darkTheme.start = `${date.getHours()}:${date.getMinutes()}`;
            } else {
                thisThemeStartTime = darkThemeStart;
                thisThemeEndTime = date;
                themeObj.darkTheme.end = `${date.getHours()}:${date.getMinutes()}`;
            };
            otherThemeStartSetter = setLightThemeStart;
            otherThemeEndSetter = setLightThemeEnd;
            otherTheme = 'lightTheme';
        };
        const startDateStamp = thisThemeStartTime.setSeconds(0, 0);
        const endDateStamp = thisThemeEndTime.setSeconds(0, 0);

        if (startDateStamp == endDateStamp) {
            otherThemeStartSetter(null);
            otherThemeEndSetter(null);
            themeObj[otherTheme].start = null;
            themeObj[otherTheme].end = null;
        } else {

            let minTime = Math.min(startDateStamp, endDateStamp);
            let maxTime = Math.max(startDateStamp, endDateStamp);

            if (startDateStamp < endDateStamp) {
                const min = minTime;
                const max = maxTime;
                maxTime = min;
                minTime = max;
            };

            const minTimeDate = new Date(minTime);
            const maxTimeDate = new Date(maxTime);

            minTime = minTimeDate.setMinutes(minTimeDate.getMinutes() + 1);
            maxTime = maxTimeDate.setMinutes(maxTimeDate.getMinutes() - 1);

            otherThemeStartSetter(new Date(minTime));
            otherThemeEndSetter(new Date(maxTime));
            themeObj[otherTheme].start = `${new Date(minTime).getHours()}:${new Date(minTime).getMinutes()}`;
            themeObj[otherTheme].end = `${new Date(maxTime).getHours()}:${new Date(maxTime).getMinutes()}`;
        };
        setAutoTheme(themeObj);
        setSubmitDisabled(false);
    };


    return (
        <div className='editForm flex1 mt10 align-s-stretch'>
            <label className='editForm-contentGroup'
                onClick={() => {
                    if (themeFromAPI?.autoTheme?.value != !autoTheme?.value) {
                        setSubmitDisabled(false);
                    } else {
                        setSubmitDisabled(true);
                    };
                    themeObj.value = !autoTheme?.value;
                    setAutoTheme(themeObj);
                }}
            >
                <div
                    className={'customCheckbox' + (autoTheme?.value ? ' checked' : '')}
                >
                    <i className="fa-solid fa-check checkbox-mark"></i>
                </div>
                <span className='noWrap'>Автоматически менять тему</span>
            </label>
            <CSSTransition
                in={autoTheme?.value}
                nodeRef={autoThemeRef}
                timeout={400}
                classNames="item"
                unmountOnExit
            >
                <div ref={autoThemeRef} className='editForm-contentGroup editForm-contentGroup--col themeShedule'>
                    <div className={'editForm-contentGroup editForm-contentGroup--col align-s-stretch' + (!darkThemeStart ? ' disabled' : '')}>
                        <span>Темная тема:</span>
                        <div className='editForm-contentGroup align-s-stretch'>
                            <label className='editForm-contentGroup align-center flex1'>
                                <span>с:</span>
                                <Flatpickr
                                    value={darkThemeStart}
                                    options={{
                                        altInput: true,
                                        altFormat: 'H:i',
                                        time_24hr: true,
                                        "locale": Russian,
                                        enableTime: true,
                                        noCalendar: true,
                                        clickOpens: darkThemeStart ? true : false,
                                    }}
                                    onChange={([date]) => {
                                        changeOtherThemeTimes({ theme: 'dark', timeType: 'start', date: date });
                                        setDarkThemeStart(date);
                                    }}
                                />
                            </label>
                            <label className='editForm-contentGroup align-center flex1'>
                                <span>до:</span>
                                <Flatpickr
                                    value={darkThemeEnd}
                                    options={{
                                        altInput: true,
                                        altFormat: 'H:i',
                                        time_24hr: true,
                                        "locale": Russian,
                                        enableTime: true,
                                        noCalendar: true,
                                        clickOpens: darkThemeEnd ? true : false,
                                    }}
                                    onChange={([date]) => {
                                        changeOtherThemeTimes({ theme: 'dark', timeType: 'end', date: date });
                                        setDarkThemeEnd(date);
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                    <div className={'editForm-contentGroup editForm-contentGroup--col align-s-stretch mt10' + (!lightThemeStart ? ' disabled' : '')}>
                        <span>Светлая тема:</span>
                        <div className='editForm-contentGroup align-s-stretch'>
                            <label className='editForm-contentGroup align-center flex1'>
                                <span>с:</span>
                                <Flatpickr
                                    value={lightThemeStart}
                                    options={{
                                        altInput: true,
                                        altFormat: 'H:i',
                                        time_24hr: true,
                                        "locale": Russian,
                                        enableTime: true,
                                        noCalendar: true,
                                        clickOpens: lightThemeStart ? true : false,
                                    }}
                                    onChange={([date]) => {
                                        changeOtherThemeTimes({ theme: 'light', timeType: 'start', date: date });
                                        setLightThemeStart(date);
                                    }}
                                />
                            </label>
                            <label className='editForm-contentGroup align-center flex1'>
                                <span>до:</span>
                                <Flatpickr
                                    value={lightThemeEnd}
                                    options={{
                                        altInput: true,
                                        altFormat: 'H:i',
                                        time_24hr: true,
                                        "locale": Russian,
                                        enableTime: true,
                                        noCalendar: true,
                                        clickOpens: lightThemeEnd ? true : false,
                                    }}
                                    onChange={([date]) => {
                                        changeOtherThemeTimes({ theme: 'light', timeType: 'end', date: date });
                                        setLightThemeEnd(date);
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </CSSTransition>
        </div>
    )
}



function Errmessage({ message }) {
    return <span className='error'>{message}</span>
};

const ModalErrmessage = withModal(Errmessage);
