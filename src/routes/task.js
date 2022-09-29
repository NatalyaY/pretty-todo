'use strict';

import React, { useState, Component } from 'react';
import {
    useNavigate,
    Form,
} from 'react-router-dom';
import * as API from './components/API';
import withModal from './components/modal';
import useEditData from './components/edit';
import Flatpickr from "react-flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js";
import "flatpickr/dist/flatpickr.min.css";

export default function Task() {

    const data = useEditData('task');

    const categories = API.getCategories().slice(1);

    const navigate = useNavigate();

    const [modalIsClosed, setmodalIsClosed] = useState(true);

    const openModal = (e) => {
        e.stopPropagation();
        setmodalIsClosed(!modalIsClosed);
    };


    return (
        <article>
            <div className="container edit-task">
                <header>
                    <h1>{data.heading}</h1>
                    <label className='edit-task-label'>
                        <input
                            onChange={() => data.state.status.setVal(!data.state.status.val)}
                            type='checkbox'
                            checked={data.state.status.val}
                            className='todo-task-checkbox'
                        />
                        <span>Задача завершена</span>
                    </label>
                    {data.item &&
                        <Form action='remove' method='POST'>
                            <button type='submit' className="fa-solid fa-xmark"></button>
                        </Form>
                    }
                </header>
                <label className='edit-task-label'>
                    <span>Что нужно сделать?</span>
                    <input
                        type="text"
                        value={data.state.name.val}
                        onChange={(e) => {
                            if ((e.target.value != '') && data.state.empty.val && data.state.validate.val) {
                                data.state.empty.setVal(false);
                            } else if (!data.state.empty.val && data.state.validate.val && (e.target.value == '')) {
                                data.state.empty.setVal(true);
                            };
                            data.state.name.setVal(e.target.value);
                        }}
                        placeholder='Название'
                        name='name'
                        className={data.state.empty.val ? 'empty' : null}
                    />
                </label>
                <label className='edit-task-label'>
                    <span>Описание:</span>
                    <textarea rows='6' value={data.state.description.val} onChange={(e) => data.state.description.setVal(e.target.value)} placeholder='Описание' name='description'></textarea>
                </label>
                <div className='edit-task-timeAndCategory'>
                    <div className="edit-task-time">
                        <span>Когда?</span>
                        <div className='edit-task-timeContainer'>
                            <i className="fa-solid fa-chevron-down inputIcon"></i>
                            <Flatpickr
                                data-enable-time
                                value={data.state.targetDate.val}
                                options={{
                                    altInput: true,
                                    altFormat: 'Y.m.d H:i',
                                    time_24hr: true,
                                    "locale": Russian,
                                    defaultHour: 23,
                                    defaultMinute: 59,
                                }}
                                onChange={([date]) => {
                                    data.state.targetDate.setVal(date.getTime());
                                }}
                            />
                        </div>
                    </div>
                    <div className='edit-task-categories'>
                        <span>Категория</span>
                        <div className='inputWrap'>
                            <input className='edit-task-categoryInput' readOnly value={categories.find(cat => cat.id == data.state.categoryId.val)?.name || 'Выбрать'} name='categoryId' onClick={(e) => openModal(e)}></input>
                            <i className="fa-solid fa-chevron-down inputIcon"></i>
                            {!modalIsClosed &&
                                <ModalCategories
                                    categories={categories}
                                    changeCategory={data.state.categoryId.setVal}
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
                    <button type='submit' className='edit-task-add btn' onClick={() => data.submitChanges()}>{data.saveBtnText}</button>
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


