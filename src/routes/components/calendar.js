'use strict';
import React, { Component, useState } from 'react';
import withModal from './modal';
import useTaskStatusesByDay from './useTaskStatuses';
import Scrollable from './scrollable';


export default function Calendar({ year, month, activeDate, activeCategory, tasks, onDayClick, onMonthClick }) {
    const monthsNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const [modalIsClosed, setmodalIsClosed] = useState(true);

    const openModal = (e) => {
        e.stopPropagation();
        setmodalIsClosed(!modalIsClosed);
    };

    function getCalendarDays({ month, tasks, category }) {
        let days = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            let day = {
                id: '' + month + i,
                number: i,
                name: dayNames[new Date(year, month, i).getDay()],
                tasks: useTaskStatusesByDay({ year, month, day: i, tasks, filterBy: category ? { key: 'categoryId', value: category } : null, period: 'date' })
            };
            days.push(day);
        };
        return days;
    }

    const days = getCalendarDays({ month, tasks, category: (activeCategory == 0) ? null : activeCategory });

    function isActiveDay(i) {
        return activeDate == i + 1;
    };

    return (
        <section>
            <div className="container">
                <div className="card">
                    <div className='calendar-month-dropdown'>
                        <button className='btn btn--transparent' onClick={(e) => openModal(e)}>
                            <span>{monthsNames[month]}</span>
                            <i className="fa-solid fa-caret-down dropdownIcon"></i>
                        </button>
                        {!modalIsClosed && <ModalCalendarDropdown monthsNames={monthsNames} month={month} onMonthClick={onMonthClick} callback={() => setmodalIsClosed(true)} />}
                    </div>
                    <Scrollable className='calendar-days-container'>
                        {days.length ? days.map((day, i) =>
                            <CalendarDay
                                day={day}
                                onDayClick={onDayClick}
                                isActive={isActiveDay(i)}
                                key={day.id}
                            />
                        ) : null}
                    </Scrollable>
                </div>
            </div>
        </section>
    )
}

class CalendarDropdown extends Component {

    shouldComponentUpdate(nextProps) {
        if (this.props.month == nextProps.month) {
            return false;
        };
        return true;
    }

    render() {
        return (
            <ul className='dropdownList'>
                {this.props.monthsNames.map((name, i) =>
                    <CalendarDropdownMonth name={name} key={name} month={this.props.month} onMonthClick={this.props.onMonthClick} i={i} />
                )
                }
            </ul>
        )
    }
}

class CalendarDropdownMonth extends Component {

    shouldComponentUpdate(nextProps) {
        if ((this.props.i == this.props.month) == (nextProps.i == nextProps.month)) {
            return false;
        };
        return true;
    }

    render() {
        return (
            <li
                className={'dropdownList-item' + (this.props.i == this.props.month ? ' active' : '')}
                onClick={() => this.props.onMonthClick(this.props.i)}
            >
                {this.props.name}
            </li>
        );
    }
}


const ModalCalendarDropdown = withModal(CalendarDropdown);


class CalendarDay extends Component {

    shouldComponentUpdate(nextProps) {
        if (((this.props.isActive) == nextProps.isActive) &&
            (this.props.month == nextProps.month) &&
            (this.props.day.tasks == nextProps.day.tasks) &&
            (this.props.pointerEvents == nextProps.pointerEvents)) {
            return false;
        };
        return true;
    }

    render() {
        return (
            <li
                className={'calendar-day bordered scrollable-item' + (this.props.isActive ? ' active' : '')}
                onClick={() => this.props.onDayClick(this.props.day.number)}
                style={{ pointerEvents: `${this.props.pointerEvents}` }}
            >
                <span className='calendar-dayName'>{this.props.day.name}</span>
                <span className='calendar-dayNumber'>{this.props.day.number}</span>
                {
                    this.props.day.tasks ?
                        <div className='tasksList'>
                            {Object.keys(this.props.day.tasks).map((key) =>
                            (
                                <span key={key + this.props.day.id + ''} className={'tasksNumber ' + `${key}TasksNumber`}>{this.props.day.tasks[key]}</span>
                            )
                            )}
                        </div>
                        : null
                }
            </li>
        );
    }
}
