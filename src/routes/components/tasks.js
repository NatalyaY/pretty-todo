'use strict';
import React, { Component, Fragment } from 'react'
import { Form } from "react-router-dom";
import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';


export default class Tasks extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showCheckbox: window.innerWidth <= 768,
            timeToUpdate: '',
        };
        this.handleResize = this.handleResize.bind(this);
        this.categoryColors = {};
        this.timer = null;
    }


    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        this.timer = null;
    }

    handleResize() {
        this.setState({ showCheckbox: window.innerWidth <= 768 });
    }

    getTime(task) {
        const dateDiff = Math.floor((task.targetDate - Date.now()) / 1000);
        if ((dateDiff <= 0) && !task.timeIsEnd) {
            task.time = "00д.:00ч.:00м.:00с.";
            task.timeIsEnd = true;
            return task;
        };
        let days = ('0' + Math.floor(dateDiff / (60 * 60 * 24))).slice(-2);
        let hours = ('0' + Math.floor(dateDiff % (60 * 60 * 24) / (60 * 60))).slice(-2);
        let minutes = ('0' + Math.floor(dateDiff % (60 * 60) / 60)).slice(-2);
        let seconds = ('0' + Math.ceil(dateDiff % (60 * 60) % 60)).slice(-2);
        task.time = (days != '00') ? `${days}д.:${hours}ч.:${minutes}м.` : `${hours}ч.:${minutes}м.:${seconds}с.`;
        return task;
    }

    setTimer() {
        this.timer = setTimeout(() => {
            this.setState({
                timeToUpdate: '',
            });
        }, 1000);
    };

    render() {
        let activeTasks = [];
        let doneTasks = [];
        if (this.props.tasks) {
            activeTasks = this.props.tasks.filter(task => task.status != 'done').sort((a, b) => a.targetDate - b.targetDate);
            doneTasks = this.props.tasks.filter(task => task.status == 'done').sort((a, b) => a.targetDate - b.targetDate);
            activeTasks.map((task) => {
                if (!task.timeIsEnd) {
                    this.getTime(task);
                };
            });
            if (activeTasks.length && activeTasks.filter(task => task.timeIsEnd).length != activeTasks.length) {
                this.setTimer();
            };
        };

        activeTasks = { status: 'active', tasks: activeTasks.map((task) => { task.ref = React.createRef(); return task; }), noDataref: React.createRef() };
        doneTasks = { status: 'done', tasks: doneTasks.map((task) => { task.ref = React.createRef(); return task; }), noDataref: React.createRef() };
        this.categoryColors = this.props.categories.reduce((acc, category) => {
            acc[category.id] = category.color;
            return acc;
        }, {});

        return (
            <section>
                <div className="container">
                    <div className="card">
                        <div className="tasks-header">
                            <h1>Мои задачи</h1>
                            <div className="tasks-header-periodBtns">
                                <button
                                    onClick={() => this.props.changeTasksPeriod('date')}
                                    className={'link' + (this.props.tasksPeriod == 'date' ? ' active' : '')}
                                >
                                    День
                                </button>
                                <button
                                    onClick={() => this.props.changeTasksPeriod('month')}
                                    className={'link' + (this.props.tasksPeriod == 'month' ? ' active' : '')}
                                >
                                    Месяц
                                </button>
                                <button
                                    onClick={() => this.props.changeTasksPeriod('all')}
                                    className={'link' + (this.props.tasksPeriod == 'all' ? ' active' : '')}
                                >
                                    Все время
                                </button>
                            </div>
                            <Form action='/task'><button type="submit" className='addBtn btn btn--colored btn--add'>Добавить задачу</button></Form>
                        </div>
                        {
                            [activeTasks, doneTasks].map((el) =>
                            (
                                <div key={el.status} className='tasks-group'>
                                    <h2 className='heading--standart'>{(el.status == 'done') ? 'Завершенные задачи' : 'Активные задачи'}</h2>
                                    <TransitionGroup className="tasks-list" component='ul'>
                                        {
                                            el.tasks.length ? el.tasks.map((task) =>
                                                <CSSTransition
                                                    key={task.id}
                                                    nodeRef={task.ref}
                                                    timeout={200}
                                                    classNames="item"
                                                >
                                                    <Task
                                                        ref={task.ref}
                                                        task={task}
                                                        time={task.time}
                                                        timeIsEnd={task.timeIsEnd}
                                                        isDone={(el.status == 'done') ? true : false}
                                                        removeTask={this.props.removeTask}
                                                        color={task.categoryId == 0 ? null : this.categoryColors[task.categoryId]}
                                                        showCheckbox={this.state.showCheckbox}
                                                        changeTaskStatus={this.props.changeTaskStatus}>
                                                    </Task>
                                                </CSSTransition>
                                            )
                                                :
                                                <CSSTransition
                                                    key={el.status}
                                                    nodeRef={el.noDataref}
                                                    timeout={200}
                                                    classNames="item"
                                                >
                                                    <p ref={el.noDataref} className='noData'>{(el.status == 'done') ? 'Нет завершенных задач' : 'Нет активных задач'}</p>
                                                </CSSTransition>

                                        }
                                    </TransitionGroup>
                                </div>
                            )
                            )
                        }
                    </div>
                </div>
            </section>
        );
    }
}

const Task = React.forwardRef((props, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const checkboxRef = React.useRef();
    const taskContentRef = React.useRef();

    const handleTaskClick = (e) => {
        if (e.target.classList.contains('deleteIcon')) {
            props.removeTask(props.task.id);
        } else if (e.target.classList.contains('editIcon')) {
            return;
        } else {
            props.changeTaskStatus(props.task.id);
        }
    };

    return (
        <li
            ref={ref}
            className={'task bordered' + (props.timeIsEnd && !props.isDone ? ' end' : '') + (props.isDone ? ' done' : '')}
            onPointerEnter={props.showCheckbox ? null : () => setIsHovered(true)}
            onPointerLeave={props.showCheckbox ? null : () => setIsHovered(false)}
            onClick={(e) => handleTaskClick(e)}
        >
            {
                <CSSTransition
                    in={(props.showCheckbox || isHovered)}
                    nodeRef={checkboxRef}
                    timeout={400}
                    classNames="fadein"
                    unmountOnExit
                >
                    <div
                        checked={props.isDone ? true : null}
                        className={'task-checkbox customCheckbox' + (props.isDone ? ' checked' : '')}
                        ref={checkboxRef}
                    >
                        <i className="fa-solid fa-check checkbox-mark"></i>
                    </div>
                </CSSTransition>
            }
            <CSSTransition
                in={(props.showCheckbox || isHovered)}
                nodeRef={taskContentRef}
                timeout={200}
                classNames="marginLeft"
            >
                <div className={"task-content" + (props.showCheckbox ? ' ml30' : '')} ref={taskContentRef}>
                    <div className="task-mainData">
                        <div className='task-info'>
                            <p>{props.task.name}</p>
                            {props.task.description != '' ?
                                <p>{props.task.description}</p>
                                : null
                            }
                        </div>
                        <div className='task-btns'>
                            <Form action={`/task/${props.task.id}`}><button type='submit' className="fa-solid fa-pen-to-square todo-task-edit editIcon"></button></Form>
                            <i className="fa-solid fa-trash deleteIcon"></i>
                        </div>
                    </div>
                    <div className='task-timeAndCategory'>
                        {!props.isDone && <p>{props.time}</p>}
                        {props.color && <div className='task-category' style={{ backgroundColor: props.color }}></div>}
                    </div>
                </div>
            </CSSTransition>
        </li>
    )
});


