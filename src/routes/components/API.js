'use strict';
import React, { Component } from 'react';
import { redirect } from 'react-router-dom';
const event = new Event("change localstorage");

function getItems(name) {
    return JSON.parse(window.localStorage.getItem(name));
}

function setItems(name, items) {
    window.localStorage.setItem(name, JSON.stringify(items));
    window.dispatchEvent(event);
}

export function getCategories() {
    if (!getItems('categories')) {
        const categories = [
            {
                id: 0, name: 'Все', color: 'gray', textColor: '#FAFAFA'
            },
            {
                id: 1, name: 'Дом', color: 'blue', textColor: '#FAFAFA'
            },
            {
                id: 2, name: 'Семья', color: 'red', textColor: '#FAFAFA'
            },
            {
                id: 3, name: 'Работа', color: 'orange', textColor: '#FAFAFA'
            },
            {
                id: 4, name: 'Спорт', color: 'green', textColor: '#FAFAFA'
            },
            {
                id: 5, name: 'Здоровье', color: 'violet', textColor: '#FAFAFA'
            },
        ];
        setItems('categories', categories);
    };
    return getItems('categories') || [];
}

export function getTasks() {
    return getItems('tasks') || [];
}

export function getUser() {
    return getItems('user') || {};
}

export function getTheme() {
    return getItems('theme') || {};
}


export function addCategory(category) {
    const userCategories = getCategories();
    category.id = parseInt(Math.random() * 1000000);
    setItems('categories', userCategories.concat([category]));
}

export function addTask(task) {
    const tasks = getTasks();
    task.creationDate = new Date().getTime();
    task.id = parseInt(Math.random() * 1000000);
    setItems('tasks', tasks.concat([task]));
}


export function removeCategory(categoryId) {
    const userCategories = getCategories();
    const index = userCategories.findIndex(category => category.id === categoryId);
    if (index !== -1) {
        userCategories.splice(index, 1);
        setItems('categories', userCategories);
    };
}

export function removeTask(taskId) {
    const tasks = getTasks();
    const index = tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
        tasks.splice(index, 1);
        setItems('tasks', tasks);
    };
}


export function editTask(updates) {
    const tasks = getTasks();
    const index = tasks.findIndex(task => task.id === updates.id);
    if (index !== -1) {
        Object.keys(updates).forEach((key) => {
            tasks[index][key] = updates[key];
        });
        setItems('tasks', tasks);
    };
}

export function editCategory(updates) {
    const userCategories = getCategories();
    const index = userCategories.findIndex(category => category.id === updates.id);
    if (index !== -1) {
        Object.keys(updates).forEach((key) => {
            userCategories[index][key] = updates[key];
        });
        setItems('categories', userCategories);
    };
}

export function editUser(updates) {
    const user = getUser();
    Object.keys(updates).forEach((key) => {
        user[key] = updates[key];
    });
    setItems('user', user);
}

export function editTheme(updates) {
    const theme = getTheme();
    Object.keys(updates).forEach((key) => {
        theme[key] = updates[key];
    });
    setItems('theme', theme);
}


export function getTask(taskId) {
    const tasks = getTasks();
    return tasks.find(task => task.id === taskId) || null;
}

export function getCategory(categoryId) {
    const userCategories = getCategories();
    return userCategories.find(category => category.id === categoryId) || null;
}


export function changeTaskStatus(taskId) {
    const tasks = getTasks();
    const index = tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
        tasks[index].status = tasks[index].status == 'active' ? 'done' : 'active';
        setItems('tasks', tasks);
    };
}


export function withSubscription(Element) {

    return class extends Component {

        constructor(props) {
            super(props);
            this.state = {
                categories: getCategories(),
                tasks: getTasks(),
            };
            this.updateState = this.updateState.bind(this);
        }

        updateState() {
            this.setState({
                categories: getCategories(),
                tasks: getTasks(),
            });
        };

        componentDidMount() {
            window.addEventListener('change localstorage', this.updateState);
            window.addEventListener('storage', this.updateState);
        }

        componentWillUnmount() {
            window.removeEventListener('change localstorage', this.updateState);
            window.removeEventListener('storage', this.updateState);
        }

        render() {
            return <Element categories={this.state.categories} tasks={this.state.tasks} />
        }
    }
}


export function removeAction({ params, request }) {
    const type = request.url.split('/')[3];
    let id = type == 'category' ? Number(params.categoryId) || null : Number(params.taskId) || null;
    if (id) {
        if (type == 'category') {
            removeCategory(id);
        } else {
            removeTask(id);
        };
    };
    return redirect('/tasks');
}

export async function editAction({ params, request }) {
    const type = request.url.split('/')[3];
    let id = type == 'category' ? Number(params.categoryId) || null : Number(params.taskId) || null;

    const data = await request.formData();
    const updates = Object.fromEntries(data);

    if (type == 'task') {
        updates.categoryId = Number(updates.categoryId);
        updates.targetDate = Number(updates.targetDate);
    };

    if (id) {
        updates.id = id;
        if (type == 'category') {
            editCategory(updates);
        } else {
            editTask(updates);
        };
    } else {
        if (type == 'category') {
            addCategory(updates);
        } else {
            addTask(updates);
        };
    };
    return redirect('/tasks');
}
