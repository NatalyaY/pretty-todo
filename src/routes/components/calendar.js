'use strict';
import React, { Component, useRef, useEffect, useState } from 'react'
import withModal from './modal';


function Calendar({ days, month, activeDate, onDayClick, onMonthClick }) {
    const monthsNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const [modalIsClosed, setmodalIsClosed] = useState(true);

    const openModal = (e) => {
        e.stopPropagation();
        setmodalIsClosed(!modalIsClosed);
    };

    return (
        <section>
            <div className="container">
                <div className='calendar-month-dropdown'>
                    <button className='calendar-month-button' onClick={(e) => openModal(e)}>{monthsNames[month]}</button>
                    {!modalIsClosed && <ModalCalendarDropdown monthsNames={monthsNames} month={month} onMonthClick={onMonthClick} callback={() => setmodalIsClosed(true)} />}
                </div>
                <ul className='calendar-days-list'>
                    {days.length ? days.map((day, i) =>
                        <CalendarDay
                            day={day}
                            onDayClick={onDayClick}
                            activeDate={activeDate}
                            key={day.id}
                        />
                    ) : null}
                </ul>
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
            <ul className='calendar-month-dropdown-menu'>
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
                className={'calendar-month-dropdown-menu-month' + (this.props.i == this.props.month ? ' active' : '')}
                onClick={() => this.props.onMonthClick(this.props.i)}
            >
                {this.props.name}
            </li>
        );
    }
}


const ModalCalendarDropdown = withModal(CalendarDropdown);


class CalendarDay extends Component {

    isActiveDay(activeDate) {
        return activeDate == this.props.day.number ? ' active' : '';
    }

    shouldComponentUpdate(nextProps) {
        if ((this.isActiveDay(this.props.activeDate) == this.isActiveDay(nextProps.activeDate)) &&
            (this.props.month == nextProps.month) &&
            (this.props.day.tasks == nextProps.day.tasks)) {
            return false;
        };
        return true;
    }

    render() {
        return (
            <li className={'calendar-day' + this.isActiveDay(this.props.activeDate)} onClick={() => this.props.onDayClick(this.props.day.number)}>
                <span className='calendar-dayName'>{this.props.day.name}</span>
                <span className='calendar-dayNumber'>{this.props.day.number}</span>
                {
                    this.props.day.tasks ?
                        <div className='calendar-dayTasks'>
                            {Object.keys(this.props.day.tasks).map((key) =>
                            (
                                <span key={key + this.props.day.id + ''} className={'calendar-day-tasks ' + key}>{this.props.day.tasks[key]}</span>
                            )
                            )}
                        </div>
                        : null
                }
            </li>
        );
    }
}


export default Calendar;