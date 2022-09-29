'use strict';

import React, { useState, Component } from 'react';
import {
    useParams,
    redirect,
    useNavigate,
    useSubmit,
    Form,
} from 'react-router-dom';
import * as API from './components/API';
import withModal from './components/modal';
import Flatpickr from "react-flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js";
import "flatpickr/dist/flatpickr.min.css";

export async function action({ request, params }) {
    const data = await request.formData();
    const updates = Object.fromEntries(data);
    updates.categoryId = Number(updates.categoryId);
    updates.targetDate = Number(updates.targetDate);

    const id = Number(params.taskId) || null;
    if (id) {
        const task = API.getTask(id);
        if (task) {
            updates.id = id;
            API.editTask(updates);
        } else {
            API.addTask(updates);
        };
    } else {
        API.addTask(updates);
    };
    return redirect('/');
}

export async function removeAction({ params }) {

    const id = Number(params.taskId) || null;
    if (id) {
        API.removeTask(id);
    };
    return redirect('/');
}

export function Task() {
    const id = Number(useParams().taskId) || null;
    const task = API.getTask(id);
    const date = task?.targetDate || new Date().setHours(23, 59, 59, 999);
    const heading = task ? 'Редактировать задачу' : 'Добавить новую задачу';
    const saveBtnText = task ? 'Сохранить' : 'Добавить';
    const taskIsDone = task?.status == 'done' ? true : false || false;

    const categories = API.getCategories().slice(1);

    const [taskName, setTaskName] = useState(task?.name || '');
    const [taskDescription, setTaskDescription] = useState(task?.description || '');
    const [taskTargetDate, setTaskTargetDate] = useState(date);
    const [taskCategory, setTaskCategory] = useState(task?.categoryId || '');
    const [taskStatus, setTaskStatus] = useState(taskIsDone);
    const [emptyName, setEmptyName] = useState(false);
    const [validate, setValidate] = useState(false);


    const navigate = useNavigate();
    const submit = useSubmit();

    function submitChanges() {
        setValidate(true);
        if (taskName == '') {
            setEmptyName(true);
            return;
        };
        const task = {
            name: taskName,
            description: taskDescription,
            targetDate: taskTargetDate,
            categoryId: taskCategory,
            status: taskStatus ? 'done' : 'active',
        };
        submit(task, { method: "post", action: `/task/${id}` });
    };

    const [modalIsClosed, setmodalIsClosed] = useState(true);

    const openModal = (e) => {
        e.stopPropagation();
        setmodalIsClosed(!modalIsClosed);
    };


    return (
        <article>
            <div className="container edit-task">
                <header>
                    <h1>{heading}</h1>
                    <label className='edit-task-label'>
                        <input
                            onChange={() => setTaskStatus(!taskStatus)}
                            type='checkbox'
                            checked={taskStatus}
                            className='todo-task-checkbox'
                        />
                        <span>Задача завершена</span>
                    </label>
                    {task &&
                        <Form action='remove' method='POST'>
                            <button type='submit' className="fa-solid fa-xmark"></button>
                        </Form>
                    }
                </header>
                <label className='edit-task-label'>
                    <span>Что нужно сделать?</span>
                    <input
                        type="text"
                        value={taskName}
                        onChange={(e) => {
                            if ((e.target.value != '') && emptyName && validate) {
                                setEmptyName(false);
                            } else if (!emptyName && validate && (e.target.value == '')) {
                                setEmptyName(true);
                            };
                            setTaskName(e.target.value);
                        }}
                        placeholder='Название'
                        name='name'
                        className={emptyName ? 'empty' : null}
                    />
                </label>
                <label className='edit-task-label'>
                    <span>Описание:</span>
                    <textarea rows='6' value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder='Описание' name='description'></textarea>
                </label>
                <div className='edit-task-timeAndCategory'>
                    <div className="edit-task-time">
                        <span>Когда?</span>
                        <div className='edit-task-timeContainer'>
                            <i className="fa-solid fa-chevron-down inputIcon"></i>
                            <Flatpickr
                                data-enable-time
                                value={taskTargetDate}
                                options={{
                                    altInput: true,
                                    altFormat: 'Y.m.d H:i',
                                    time_24hr: true,
                                    "locale": Russian,
                                    defaultHour: 23,
                                    defaultMinute: 59,
                                }}
                                onChange={([date]) => {
                                    setTaskTargetDate(date.getTime());
                                }}
                            />
                        </div>
                    </div>
                    <div className='edit-task-categories'>
                        <span>Категория</span>
                        <div className='inputWrap'>
                            <input className='edit-task-categoryInput' readOnly value={categories.find(cat => cat.id == taskCategory)?.name || 'Выбрать'} name='categoryId' onClick={(e) => openModal(e)}></input>
                            <i className="fa-solid fa-chevron-down inputIcon"></i>
                            {!modalIsClosed &&
                                <ModalCategories
                                    categories={categories}
                                    changeCategory={setTaskCategory}
                                    callback={() => setmodalIsClosed(true)}
                                />}
                        </div>
                    </div>
                </div>
                <footer className='edit-task-btns'>
                    <button type="button"
                        onClick={() => {
                            navigate(-1);
                        }} className='edit-task-cancel btn'>Отменить</button>
                    <button type='submit' className='edit-task-add btn' onClick={() => submitChanges()}>{saveBtnText}</button>
                </footer>
            </div>
        </article>
    )
}


class Categories extends Component {

    render() {
        return (
            <ul className='edit-task-categoriesList'>
                {this.props.categories.map((category) =>
                    <li className='edit-task-category' style={{ backgroundColor: category.color }} onClick={() => this.props.changeCategory(category.id)} key={category.id}>
                        <span>{category.name}</span>
                    </li>
                )
                }
            </ul>
        );
    }
}


const ModalCategories = withModal(Categories);


