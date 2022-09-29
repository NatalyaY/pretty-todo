'use strict';
import React, { Component, Fragment } from 'react';
import Calendar from './components/calendar';
import Categories from './components/categories';
import {Tasks, action} from './components/tasks';
import * as API from './components/API';
export { action };


export class Todos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: [],
            categories: [],
            days: [],
            filteredTasks: [],
            activeDate: new Date().getDate(),
            activeMonth: new Date().getMonth(),
            activeCategory: 0,
            tasksPeriod: 'date',
        };
        this.year = new Date().getFullYear();
        this.dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        this.changeActiveDate = this.changeActiveDate.bind(this);
        this.changeActiveMonth = this.changeActiveMonth.bind(this);
        this.removeCategory = this.removeCategory.bind(this);
        this.removeTask = this.removeTask.bind(this);
        this.changeActiveCategory = this.changeActiveCategory.bind(this);
        this.changeTasksPeriod = this.changeTasksPeriod.bind(this);
        this.changeTasksStatus = this.changeTasksStatus.bind(this);
    }

    componentDidMount() {
        const state = Object.assign({}, this.state);
        state.tasks = API.getTasks();
        const categories = API.getCategories();
        state.categories = categories;
        this.setCalculatedState(state);
        this.setState(state);
    }

    update() {
        const state = Object.assign({}, this.state);
        state.tasks = this.props.tasks;
        state.categories = this.props.categories;
        this.setCalculatedState(state);
        this.setState(state);
    }

    getTaskStatusesByDay(month, day, tasks, filterBy = null, period = true) {
        if (!tasks || !tasks.length) {
            return null;
        };

        const filteredTasks = period ? tasks.filter((task) => {
            const date = typeof task.targetDate === 'string' ? new Date(Number(task.targetDate)).setHours(0, 0, 0, 0) : new Date(task.targetDate).setHours(0, 0, 0, 0);
            const dayDate = new Date(this.year, month, day).getTime();
            return date === dayDate;
        }) : tasks;

        let groupedTasks;

        if (filterBy) {
            groupedTasks = filteredTasks.filter(task => {
                if ((filterBy.key == 'categoryId') && (filterBy.value == 0)) {
                    return true;
                } else {
                    return task[filterBy.key] == filterBy.value;
                };
            });
        } else {
            groupedTasks = filteredTasks;
        };

        if (!groupedTasks.length) {
            return null;
        };

        return groupedTasks.reduce((acc, task) => {
            acc[task.status] = acc[task.status] + 1 || 1;
            return acc;
        }, {});
    }

    getFilteredTasks({ query = {}, tasks = this.state.tasks }) {
        if (!tasks || !tasks.length) {
            return null;
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

    getDaysInMonth(month) {
        return new Date(this.year, month + 1, 0).getDate();
    }

    getDayName(day, month) {
        return this.dayNames[new Date(this.year, month, day).getDay()];
    }

    getCalendarDays({ month = this.state.activeMonth, tasks = this.state.tasks, category = null }) {
        let days = [];
        for (let i = 1; i <= this.getDaysInMonth(month); i++) {
            let day = {
                id: '' + month + i,
                number: i,
                name: this.getDayName(i, month),
                tasks: this.getTaskStatusesByDay(month, i, tasks, category ? { key: 'categoryId', value: category } : null)
            };
            days.push(day);
        }
        return days;
    }

    setCalculatedState(state) {
        state.days = this.getCalendarDays({ month: state.activeMonth, tasks: state.tasks, category: (state.activeCategory == 0) ? null : state.activeCategory });
        state.categories.map((category) => {
            category.todayTasks = this.getTaskStatusesByDay(state.activeMonth, state.activeDate, state.tasks, { key: 'categoryId', value: category.id }, state.tasksPeriod == 'date' ? true : false);
        });
        const tasksPeriodFilter = this.getTasksPeriodFilter(new Date(this.year, state.activeMonth, state.activeDate), state.tasksPeriod);
        const query = Object.assign({ categoryId: state.activeCategory }, tasksPeriodFilter);
        state.filteredTasks = this.getFilteredTasks({ query, tasks: state.tasks });
    }

    changeActiveDate(date) {
        const state = Object.assign({}, this.state);
        state.activeDate = date;
        this.setCalculatedState(state);
        this.setState(state);
    }

    changeActiveMonth(month) {
        const state = Object.assign({}, this.state);
        state.activeMonth = month;
        if (month != new Date().getMonth()) {
            if (!state.lastActiveDate) {
                state.lastActiveDate = state.activeDate;
            }
            state.activeDate = 1;
        } else {
            state.activeDate = state.lastActiveDate || new Date().getDate();
        };
        this.setCalculatedState(state);
        this.setState(state);
    }

    removeCategory(id) {
        const state = Object.assign({}, this.state);
        const index = state.categories.findIndex(category => category.id === id);
        if (index >= 0) {
            API.removeCategory(id);
            state.categories.splice(index, 1);
            state.tasks = [].concat(state.tasks).map(task => {
                if (task.categoryId == id) {
                    task.categoryId = null;
                };
                return task;
            });
            state.activeCategory = 0;
            this.setState(state);
        }
    }

    removeTask(taskId) {
        const state = Object.assign({}, this.state);
        const index = state.tasks.findIndex(task => task.id === taskId);
        if (index >= 0) {
            API.removeTask(taskId);
            state.tasks.splice(index, 1);
            this.setCalculatedState(state);
            this.setState(state);
        };
    }

    changeActiveCategory(categoryId) {
        const state = Object.assign({}, this.state);
        state.activeCategory = categoryId;
        this.setCalculatedState(state);
        this.setState(state);
    }

    getTasksPeriodFilter(date, period = this.state.tasksPeriod) {
        if (period == 'date') {
            return { date: date };
        } else if (period == 'month') {
            return { month: date.getMonth() }
        } else return {};
    }

    changeTasksPeriod(period) {
        const state = Object.assign({}, this.state);
        state.tasksPeriod = period;
        this.setCalculatedState(state);
        this.setState(state);
    }

    changeTasksStatus(taskId) {
        const state = Object.assign({}, this.state);
        API.changeTaskStatus(taskId);
        state.tasks = API.getTasks();
        this.setCalculatedState(state);
        this.setState(state);
    }

    render() {
        this.update();
        return (
            <Fragment>
                {this.state.days.length &&
                    <Calendar
                        month={this.state.activeMonth}
                        activeDate={this.state.activeDate}
                        onDayClick={this.changeActiveDate}
                        onMonthClick={this.changeActiveMonth}
                        days={this.state.days}
                    /> || <p>Loading...</p>}
                <Categories
                    categories={this.state.categories}
                    removeCategory={this.removeCategory}
                    changeActiveCategory={this.changeActiveCategory}
                    activeCategory={this.state.activeCategory}
                />
                <Tasks
                    tasks={this.state.filteredTasks}
                    removeTask={this.removeTask}
                    categories={this.state.categories}
                    changeTasksPeriod={this.changeTasksPeriod}
                    changeTasksStatus={this.changeTasksStatus}
                />
            </Fragment>
        )
    }
}

const TodosWithSubscription = API.withSubscription(Todos);
export {TodosWithSubscription};

