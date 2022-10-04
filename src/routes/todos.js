'use strict';
import React, { Component, Fragment } from 'react';
import Calendar from './components/calendar';
import Categories from './components/categories';
import Tasks from './components/tasks';
import * as API from './components/API';


class Todos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeDate: new Date().getDate(),
            activeMonth: new Date().getMonth(),
            activeCategory: 0,
            tasksPeriod: 'date',
        };
        this.year = new Date().getFullYear();
        this.filteredTasks = [];

        this.changeActiveDate = this.changeActiveDate.bind(this);
        this.changeActiveMonth = this.changeActiveMonth.bind(this);
        this.removeCategory = this.removeCategory.bind(this);
        this.removeTask = this.removeTask.bind(this);
        this.changeActiveCategory = this.changeActiveCategory.bind(this);
        this.changeTasksPeriod = this.changeTasksPeriod.bind(this);
        this.changeTaskStatus = this.changeTaskStatus.bind(this);
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

    setCalculatedState(state = this.state) {
        const tasksPeriodFilter = this.getTasksPeriodFilter(new Date(this.year, state.activeMonth, state.activeDate), state.tasksPeriod);
        const query = Object.assign({ categoryId: state.activeCategory }, tasksPeriodFilter);
        this.filteredTasks = this.getFilteredTasks({ query, tasks: this.props.tasks });
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
        const index = this.props.categories.findIndex(category => category.id === id);
        if (index >= 0) {
            API.removeCategory(id);
            this.props.tasks.forEach((task) => {
                if (task.categoryId == id) {
                    task.categoryId = null;
                    API.editTask(task);
                };
            })
            state.activeCategory = 0;
            this.setState(state);
        }
    }

    removeTask(taskId) {
        API.removeTask(taskId);
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

    changeTaskStatus(taskId) {
        API.changeTaskStatus(taskId);
    }

    render() {
        this.setCalculatedState();
        return (
            <Fragment>
                <Calendar
                    year={this.year}
                    month={this.state.activeMonth}
                    activeDate={this.state.activeDate}
                    activeCategory={this.state.activeCategory}
                    onDayClick={this.changeActiveDate}
                    onMonthClick={this.changeActiveMonth}
                    tasks={this.props.tasks}
                />
                <Categories
                    year={this.year}
                    categories={this.props.categories}
                    tasks={this.props.tasks}
                    month={this.state.activeMonth}
                    activeDate={this.state.activeDate}
                    tasksPeriod={this.state.tasksPeriod}
                    removeCategory={this.removeCategory}
                    changeActiveCategory={this.changeActiveCategory}
                    activeCategory={this.state.activeCategory}
                />
                <Tasks
                    tasks={this.filteredTasks}
                    removeTask={this.removeTask}
                    categories={this.props.categories}
                    changeTasksPeriod={this.changeTasksPeriod}
                    changeTaskStatus={this.changeTaskStatus}
                    tasksPeriod={this.state.tasksPeriod}
                />
            </Fragment>
        )
    }
}

export default API.withSubscription(Todos);

