'use strict';
import React from 'react'
import { Form } from "react-router-dom";
import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';
import getTimeParts from '../helpers/getTimeParts';


function Tasks(props) {
    const [showCheckbox, setShowCheckbox] = React.useState(window.innerWidth <= 768);
    const [activeTasksOptions, setActiveTasksOptions] = React.useState(null);
    const [doneTasksOptions, setDoneTasksOptions] = React.useState(null);
    const [categoryColors, setCategoryColors] = React.useState({});

    let timer = null;

    const handleResize = () => {
        setShowCheckbox(window.innerWidth <= 768);
    };

    const getTime = (task) => {
        const dateDiff = Math.floor((task.targetDate - Date.now()) / 1000);
        if ((dateDiff <= 0) && !task.timeIsEnd) {
            task.time = "00д.:00ч.:00м.:00с.";
            task.timeIsEnd = true;
            return task;
        };
        let { days, hours, minutes, seconds } = getTimeParts(dateDiff);
        days = ('0' + days).slice(-2);
        hours = ('0' + hours).slice(-2);
        minutes = ('0' + minutes).slice(-2);
        seconds = ('0' + seconds).slice(-2);
        task.time = (days != '00') ? `${days}д.:${hours}ч.:${minutes}м.` : `${hours}ч.:${minutes}м.:${seconds}с.`;
        return task;
    };

    const setTimeToActiveTasks = () => {
        const currentActiveTasks = props.tasks.length ? props.tasks.filter(task => task.status != 'done').sort((a, b) => a.targetDate - b.targetDate) : [];

        const activeTasksWithTime = currentActiveTasks.map((task) => {
            return !task.timeIsEnd ? getTime(task) : task;
        });

        const currentActiveTasksOptions = { status: 'active', tasks: activeTasksWithTime.map((task) => { task.ref = React.createRef(); return task; }), noDataref: React.createRef() };

        setActiveTasksOptions(currentActiveTasksOptions);

        if (activeTasksWithTime.length && activeTasksWithTime.filter(task => task.timeIsEnd).length != activeTasksWithTime.length) {
            timer = setTimeout(setTimeToActiveTasks, 1000);
        };
    };

    React.useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
            timer = null;
        };
    }, []);

    React.useEffect(() => {
        const currentDoneTasks = props.tasks.length ? props.tasks.filter(task => task.status == 'done').sort((a, b) => a.targetDate - b.targetDate) : [];
        const currentDoneTasksOptions = { status: 'done', tasks: currentDoneTasks.map((task) => { task.ref = React.createRef(); return task; }), noDataref: React.createRef() };

        setDoneTasksOptions(currentDoneTasksOptions);
        setTimeToActiveTasks();
        return () => {
            clearTimeout(timer);
        };
    }, [props.tasks]);


    React.useEffect(() => {
        const currentCategoryColors = props.categories.reduce((acc, category) => {
            acc[category.id] = category.color;
            return acc;
        }, {});
        setCategoryColors(currentCategoryColors);
    }, [props.categories]);

    return (
        <section>
            <div className="container">
                <div className="card">
                    <div className="tasks-header">
                        <h1>Мои задачи</h1>
                        <div className="tasks-header-periodBtns">
                            <button
                                onClick={() => props.changeTasksPeriod('date')}
                                className={'link' + (props.tasksPeriod == 'date' ? ' active' : '')}
                            >
                                День
                            </button>
                            <button
                                onClick={() => props.changeTasksPeriod('month')}
                                className={'link' + (props.tasksPeriod == 'month' ? ' active' : '')}
                            >
                                Месяц
                            </button>
                            <button
                                onClick={() => props.changeTasksPeriod('all')}
                                className={'link' + (props.tasksPeriod == 'all' ? ' active' : '')}
                            >
                                Все время
                            </button>
                        </div>
                        <Form action='/task'><button type="submit" className='addBtn btn btn--colored btn--add'>Добавить задачу</button></Form>
                    </div>
                    {activeTasksOptions && doneTasksOptions &&
                        [activeTasksOptions, doneTasksOptions].map((el) =>
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
                                                    removeTask={props.removeTask}
                                                    color={task.categoryId == 0 ? null : categoryColors[task.categoryId]}
                                                    showCheckbox={showCheckbox}
                                                    changeTaskStatus={props.changeTaskStatus}>
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
                    }
                </div>
            </div>
        </section>
    );
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
                            <h4>{props.task.name}</h4>
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

export default Tasks

