'use strict';
import React, { useState } from 'react';
import useModal from '../helpers/useModal';
import getTaskStatusesByDay from '../helpers/getTaskStatusesByDay';
import Scrollable from '../helpers/Scrollable';


export default function Calendar({ year, month, activeDate, activeCategory, tasks, onDayClick, onMonthClick }) {

    return (
        <section>
            <div className="container">
                <div className="card">
                    <CalendarDropdown month={month} onMonthClick={onMonthClick}/>
                    <CalendarDays
                        year={year}
                        month={month}
                        tasks={tasks}
                        activeCategory={activeCategory}
                        onDayClick={onDayClick}
                        activeDate={activeDate}
                    />
                </div>
            </div>
        </section>
    )
}


function CalendarDropdown({ month, onMonthClick }) {
    const [modalIsClosed, setmodalIsClosed] = useState(true);
    const monthsNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    const openModal = (e) => {
        e.stopPropagation();
        setmodalIsClosed(!modalIsClosed);
    };

    return (
        <div className='calendar-month-dropdown'>
            <button className='btn btn--transparent' onClick={(e) => openModal(e)}>
                <span>{monthsNames[month]}</span>
                <i className="fa-solid fa-caret-down dropdownIcon"></i>
            </button>
            {!modalIsClosed && <ModalCalendarMonthsList monthsNames={monthsNames} month={month} onMonthClick={onMonthClick} callback={() => setmodalIsClosed(true)} />}
        </div>
    )
}

function CalendarMonthsList(props) {
    return (
        <ul className='dropdownList'>
            {props.monthsNames.map((name, i) =>
                <CalendarDropdownMonth name={name} key={name} month={props.month} onMonthClick={props.onMonthClick} i={i} />
            )
            }
        </ul>
    )
}

function CalendarDropdownMonth(props) {
    return (
        <li
            className={'dropdownList-item' + (props.i == props.month ? ' active' : '')}
            onClick={() => props.onMonthClick(props.i)}
        >
            {props.name}
        </li>
    )
}

function CalendarDays({ year, month, tasks, activeCategory, onDayClick, activeDate }) {
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const [days, setDays] = useState([]);


    function getCalendarDays({ month, tasks, category }) {
        let days = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            let day = {
                id: '' + month + i,
                number: i,
                name: dayNames[new Date(year, month, i).getDay()],
                tasks: getTaskStatusesByDay({ year, month, day: i, tasks, filterBy: category ? { key: 'categoryId', value: category } : null, period: 'date' })
            };
            days.push(day);
        };
        return days;
    };

    React.useEffect(() => {
        setDays(getCalendarDays({ month, tasks, category: (activeCategory == 0) ? null : activeCategory }))
    }, [month, tasks, activeCategory]);

    const isActiveDay = (i) => {
        return activeDate == i + 1;
    };

    return (
        days.length ?
            <Scrollable className='calendar-days-container'>
                {days.map((day, i) =>
                    <CalendarDay
                        day={day}
                        onDayClick={onDayClick}
                        isActive={isActiveDay(i)}
                        key={day.id}
                    />
                )}
            </Scrollable>
            : null
    );
}

function CalendarDay(props) {
    return (
        <li
            className={'calendar-day bordered scrollable-item' + (props.isActive ? ' active' : '')}
            onClick={() => props.onDayClick(props.day.number)}
            style={{ pointerEvents: `${props.pointerEvents}` }}
        >
            <span className='calendar-dayName'>{props.day.name}</span>
            <span className='calendar-dayNumber'>{props.day.number}</span>
            {
                props.day.tasks ?
                    <div className='tasksList'>
                        {Object.keys(props.day.tasks).map((key) =>
                        (
                            <span key={key + props.day.id + ''} className={'tasksNumber ' + `${key}TasksNumber`}>{props.day.tasks[key]}</span>
                        )
                        )}
                    </div>
                    : null
            }
        </li>
    );
}

const ModalCalendarMonthsList = useModal(CalendarMonthsList);

