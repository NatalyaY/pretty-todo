'use strict';
import React from 'react';
import { Link } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import Flatpickr from "react-flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js";
import "flatpickr/dist/flatpickr.min.css";
import { UserContext } from '../userContext';

import useModal from './helpers/useModal';
import getTaskStatusesByDay from './helpers/getTaskStatusesByDay';
import getTimeParts from './helpers/getTimeParts';
import getCorrectTextEndings from './helpers/getCorrectTextEndings';

import * as API from './helpers/API';


export default function Main() {
    const { user } = React.useContext(UserContext);
    const name = (user.data.name && user.data.name != ' ') ? user.data.name : 'Гость';

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
        return { greetingsText, timeWhenChange };
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
            <div className="container">
                <h1 className='mainPageGreetings'>{`${greetings}, ${name}!`}</h1>
                <section className='editForm-contentGroup editForm-contentGroup--row align-start'>
                    <div className="card flex1">
                        <UserData user={user} />
                    </div>
                    <section className='df df--col flex1'>
                        <div className="card">
                            <TimeAndDate />
                        </div>
                        <div className="card">
                            <TodayTasks tasks={user.tasks} />
                        </div>
                        <div className="card">
                            <UsageDuration userCreationDate={user.creationDate} tasksQty={user.tasks.length} />
                        </div>
                    </section>

                </section>
            </div>
        </section>
    )
}


function UserData(props) {
    const [preview, setPreview] = React.useState(null);
    const [name, setName] = React.useState(props.user.data.name || '');
    const [filetype, setFileType] = React.useState('');
    const [errmessage, setErrmessage] = React.useState('');
    const [submitDisabled, setSubmitDisabled] = React.useState(true);


    const theme = props.user.theme;
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
            API.editUserData(newUser);
        };

        if (Object.keys(autoTheme).length) {
            let theme = {
                ...theme,
                autoTheme,
            };
            API.editTheme(theme);
        };
        setPreview(null);
        setSubmitDisabled(true);
    };

    return (
        <div className='df df--wrap gap30 align-start'>
            <label className='df df--col gap10 flex1'>
                <div className="userImgWrap userImgWrap--main">
                    {
                        props.user.data.avatar || preview ? <img className="userImg" src={preview || props.user.data.avatar} alt="" /> :
                            <svg className="userImg"><use href="../img/user.svg#avatarDefault" /></svg>
                    }
                </div>
                <span className='userAddImgLink link bold'>{props.user.data.avatar ? 'изменить фото' : 'добавить фото'}</span>
                <input
                    type="file"
                    onChange={onChangeImg}
                    name='img'
                    hidden
                />
            </label>
            <div className="df df--col gap10 flex1">
                <label className='df df--col gap10 align-s-stretch'>
                    <span className='bold'>Ваш никнейм:</span>
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
            start: lightThemeStart ? `${lightThemeStart.getHours()}:${lightThemeStart.getMinutes()}` : null,
            end: lightThemeEnd ? `${lightThemeEnd.getHours()}:${lightThemeEnd.getMinutes()}` : null,
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
                        <span className='bold'>Темная тема:</span>
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
                        <span className='bold'>Светлая тема:</span>
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

function TimeAndDate() {
    const [date, setDate] = React.useState(new Date());
    const monthsNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDate(new Date())
        }, 1000);
        return () => {
            clearTimeout(timer);
        }
    });

    return (
        <>
            <h2 className='mb20'>Такс такс такс</h2>
            <div className='df df--wrap gap10 justify-sb'>
                <div className='df df--col gap5'>
                    <span>На часах у нас</span>
                    <div className='df df--center bold gap10'>
                        <i className="fa-regular fa-clock fz24"></i>
                        <span className='fz25 noWrap'>{`${date.toLocaleTimeString()}`}</span>
                    </div>
                </div>
                <div className='df df--col gap5'>
                    <span>А сегодня у нас</span>
                    <div className='df df--center bold gap10'>
                        <i className="fa-regular fa-calendar fz24"></i>
                        <span className='fz25 noWrap'>{`${date.getDate()} ${monthsNames[date.getMonth()]} ${date.getFullYear()}`}</span>
                    </div>
                </div>
            </div>
        </>
    )
}

function TodayTasks({ tasks }) {
    const today = new Date();
    const todayTasks = getTaskStatusesByDay({ year: today.getFullYear(), month: today.getMonth(), day: today.getDate(), tasks, period: 'date' });

    return (
        <>
            <h2 className='mb20'>Задачи на сегодня</h2>
            <div className='df df--wrap gap10 justify-sb'>
                {
                    tasks.length &&
                    (
                        todayTasks ?
                            (
                                Object.keys(todayTasks).map((key) =>
                                (
                                    <p key={key + ''} className='df df--center gap10' style={key == 'done' ? { 'order': 1 } : null}>
                                        <span className={'tasksNumber fz25 ' + `${key}TasksNumber`}>{todayTasks[key]}</span>
                                        <span className='bold'>{getCorrectTextEndings({ qty: todayTasks[key], type: key })}</span>
                                    </p>
                                )
                                )
                            )
                            : <p>На сегодня нет задач</p>
                    )

                    || <p>Вы еще не создавали задач</p>
                }
            </div>
            <Link to='/tasks' className='btn btn--transparent link--woUnderline mt20' style={{ display: 'block', textAlign: 'center' }}>
                К задачам
            </Link>
        </>
    )
}

function UsageDuration({ userCreationDate, tasksQty }) {
    const [date, setDate] = React.useState(Date.now());

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDate(new Date());
        }, 1000);
        return () => {
            clearTimeout(timer);
        };
    });

    const duration = Math.floor((date - userCreationDate) / 1000);
    const { months, weeks, days, hours } = getTimeParts(duration);
    let usageTime;
    if (months || weeks || days || hours) {
        usageTime = '' + (months ? `${months} мес. ` : '') + (weeks ? `${weeks} нед. ` : '') + (days ? `${days} д. ` : '') + (hours ? `${hours} ч.` : '')
    };

    return (
        <>
            <h2 className='mb20'>Немного статистики</h2>
            <div className='df df--wrap gap10 justify-sb'>
                <div className='df df--col bold gap10'>
                    <p>Вы используете сервис:</p>
                    <p className='fz25'>{usageTime || 'меньше часа'}</p>
                </div>
                <div className='df df--col bold gap10'>
                    <p>Всего вы создали:</p>
                    <p className='fz25'>{tasksQty + getCorrectTextEndings({ qty: tasksQty, textsArr: [" задачу", " задачи", " задач"] })}</p>
                </div>
            </div>
            <Link to='/stat' className='btn btn--transparent link--woUnderline mt20' style={{ display: 'block', textAlign: 'center' }}>
                К статистике
            </Link>

        </>
    )
}

function Errmessage({ message }) {
    return <span className='error'>{message}</span>
};

const ModalErrmessage = useModal(Errmessage);
