'use strict';
import React, { Component, Fragment } from 'react'
import { Form } from "react-router-dom";


export default class Tasks extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showCheckbox: window.innerWidth <= 768,
        };
        this.handleResize = this.handleResize.bind(this);
        this.categoryColors = {};
    }

    handleResize() {
        this.setState({ showCheckbox: window.innerWidth <= 768 });
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    render() {
        let activeTasks = this.props.tasks ? this.props.tasks.filter(task => task.status != 'done').sort((a, b) => a.targetDate - b.targetDate) : [];
        let doneTasks = this.props.tasks ? this.props.tasks.filter(task => task.status == 'done').sort((a, b) => a.targetDate - b.targetDate) : [];
        activeTasks = { status: 'active', tasks: activeTasks };
        doneTasks = { status: 'done', tasks: doneTasks };

        this.categoryColors = this.props.categories.reduce((acc, category) => {
            acc[category.id] = category.color;
            return acc;
        }, {});

        return (
            <section>
                <div className="container">
                    <h1>Мои задачи</h1>
                    <button onClick={() => this.props.changeTasksPeriod('date')}>День</button>
                    <button onClick={() => this.props.changeTasksPeriod('month')}>Месяц</button>
                    <button onClick={() => this.props.changeTasksPeriod('all')}>Все время</button>
                    <Form action='task'><button type="submit">Добавить задачу</button></Form>
                    {
                        [activeTasks, doneTasks].map((el) =>
                        (
                            <Fragment key={el.status}>
                                <h2>{(el.status == 'done') ? 'Завершенные задачи' : 'Активные задачи'}</h2>
                                <ul className='todo-tasks todo-tasks-done'>
                                    {
                                        el.tasks.length ? el.tasks.map((task) =>
                                            <Task
                                                task={task}
                                                key={task.id}
                                                isDone={(el.status == 'done') ? true : false}
                                                removeTask={this.props.removeTask}
                                                color={this.categoryColors[task.categoryId]}
                                                showCheckbox={this.state.showCheckbox}
                                                changeTaskStatus={this.props.changeTaskStatus}
                                            />
                                        )
                                            : <p>{(el.status == 'done') ? 'Нет завершенных задач' : 'Нет активных задач'}</p>
                                    }
                                </ul>
                            </Fragment>
                        )
                        )
                    }
                </div>
            </section>
        );
    }
}

class Task extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: this.getTime(),
            isEnd: false,
            showCheckbox: false,
        };
        this.timer = null;
        this.setTime = this.setTime.bind(this);
    }

    getTime() {
        const dateDiff = Math.floor((this.props.task.targetDate - Date.now()) / 1000);
        if (dateDiff <= 0) {
            return "0д.:0ч.:0м.:0с.";
        };
        let days = Math.floor(dateDiff / (60 * 60 * 24));
        let hours = Math.floor(dateDiff % (60 * 60 * 24) / (60 * 60));
        let minutes = Math.floor(dateDiff % (60 * 60) / 60);
        let seconds = Math.ceil(dateDiff % (60 * 60) % 60);
        return days ? `${days}д.:${hours}ч.:${minutes}м.` : `${hours}ч.:${minutes}м.:${seconds}с.`;
    }

    setTime() {
        if (Math.floor((this.props.task.targetDate - Date.now()) / 1000) <= 0) {
            this.timer = null;
            this.setState({
                isEnd: true,
            });
            return;
        };
        this.setState({
            time: this.getTime(),
        });
        this.timer = setTimeout(this.setTime, 1000);
    }

    componentDidMount() {
        if (!this.props.isDone) {
            this.timer = setTimeout(this.setTime, 1000);
        }
    }

    componentWillUnmount() {
        this.timer = null;
    }

    showCheckbox(state) {
        if (this.props.showCheckbox) return;
        this.setState({ showCheckbox: state });
    }

    render() {
        return (
            <li
                className={'todo-task' + (this.state.isEnd ? ' end' : '') + (this.props.isDone ? ' done' : '')}
                onPointerEnter={(e) => this.showCheckbox(true)}
                onPointerLeave={(e) => this.showCheckbox(false)}
            >
                <div className='todo-task-data'>
                    <h3>{this.props.task.name}</h3>
                    <p>{this.props.task.description}</p>
                </div>
                {(this.props.showCheckbox || this.state.showCheckbox) &&
                    <input onChange={() => this.props.changeTaskStatus(this.props.task.id)} type='checkbox' checked={this.props.isDone ? true : null} className='todo-task-checkbox'></input>
                }
                <div className='todo-task-btns'>
                    <Form action={`/task/${this.props.task.id}`}><button type='submit' className="fa-solid fa-pen-to-square todo-task-edit"></button></Form>
                    <i className="fa-solid fa-xmark todo-task-delete" onClick={() => this.props.removeTask(this.props.task.id)}></i>
                </div>
                <div className='todo-task-timeAndCategory'>
                    {!this.props.isDone && <p>{this.state.time}</p>}
                    {this.props.color && <div className='todo-task-category' style={{ backgroundColor: this.props.color }}></div>}
                </div>
            </li>
        );
    }
}


