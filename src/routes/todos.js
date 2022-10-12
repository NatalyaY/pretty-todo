'use strict';
import React, { Fragment } from 'react';
import Calendar from './components/calendar';
import Categories from './components/categories';
import Tasks from './components/tasks';
import * as API from './helpers/API';
import { UserContext } from '../userContext';


export default function Todos() {

    const today = new Date();
    const yearNow = today.getFullYear();
    const dateNow = today.getDate();
    const monthNow = today.getMonth();
    let filteredTasks = [];

    const [activeDate, setActiveDate] = React.useState(dateNow);
    const [activeMonth, setActiveMonth] = React.useState(monthNow);
    const [activeCategory, setActiveCategory] = React.useState(0);
    const [tasksPeriod, setTasksPeriod] = React.useState('date');
    const [lastActiveDate, setLastActiveDate] = React.useState(null);
    const { user } = React.useContext(UserContext);

    const getFilteredTasks = ({ query = {} }) => {
        const tasks = user.tasks;

        if (!tasks || !tasks.length) {
            return [];
        };
        return tasks.filter(task => {
            return Object.keys(query).every((key) => {
                if (key == 'month') {
                    const date = typeof task.targetDate === 'string' ? Number(task.targetDate) : task.targetDate;
                    return new Date(date).getMonth() == query[key];
                } else if (key == 'date') {
                    const taskDate = typeof task.targetDate === 'string' ? new Date(Number(task.targetDate)).setHours(0, 0, 0, 0) : new Date(task.targetDate).setHours(0, 0, 0, 0);
                    const dayDate = query[key].getTime();
                    return taskDate === dayDate;
                } else {
                    if ((key == 'categoryId') && (query[key] == 0)) {
                        return true;
                    } else {
                        return task[key] === query[key];
                    };
                };
            })
        });
    }

    const setCalculatedState = () => {
        const tasksPeriodFilter = getTasksPeriodFilter(new Date(yearNow, activeMonth, activeDate));
        const query = Object.assign({ categoryId: activeCategory }, tasksPeriodFilter);
        filteredTasks = getFilteredTasks({ query });
    }

    const changeActiveMonth = (month) => {
        setActiveMonth(month);
        if (month != monthNow) {
            if (activeMonth == monthNow) {
                setLastActiveDate(activeDate);
            };
            setActiveDate(1);
        } else {
            setActiveDate(lastActiveDate || date);
        };
    }

    const removeCategory = (id) => {
        const index = user.categories.findIndex(category => category.id === id);
        if (index >= 0) {
            API.removeCategory(id);
            user.tasks.forEach((task) => {
                if (task.categoryId == id) {
                    task.categoryId = null;
                    API.editTask(task);
                };
            });
            setActiveCategory(0);
        };
    }

    const getTasksPeriodFilter = (date) => {
        if (tasksPeriod == 'date') {
            return { date: date };
        } else if (tasksPeriod == 'month') {
            return { month: date.getMonth() }
        } else return {};
    }

    setCalculatedState();

    return (
        <Fragment>
            <Calendar
                year={yearNow}
                month={activeMonth}
                activeDate={activeDate}
                activeCategory={activeCategory}
                onDayClick={setActiveDate}
                onMonthClick={changeActiveMonth}
                tasks={user.tasks||[]}
            />
            <Categories
                year={yearNow}
                categories={user.categories||[]}
                tasks={user.tasks||[]}
                month={activeMonth}
                activeDate={activeDate}
                tasksPeriod={tasksPeriod}
                removeCategory={removeCategory}
                changeActiveCategory={setActiveCategory}
                activeCategory={activeCategory}
            />
            <Tasks
                tasks={filteredTasks}
                removeTask={API.removeTask}
                categories={user.categories||[]}
                changeTasksPeriod={setTasksPeriod}
                changeTaskStatus={API.changeTaskStatus}
                tasksPeriod={tasksPeriod}
            />
        </Fragment>
    )
}


