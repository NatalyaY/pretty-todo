'use strict';

import React, { useState, Component } from 'react';
import {
    useNavigate,
    Form,
} from 'react-router-dom';
import * as API from './helpers/API';
import useModal from './helpers/useModal';
import useEditForm from './helpers/useEditForm';
import Flatpickr from "react-flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js";
import "flatpickr/dist/flatpickr.min.css";


export default function Task() {

    const data = useEditForm('task');

    const categories = API.getCategories().slice(1);

    const navigate = useNavigate();

    const [modalIsClosed, setmodalIsClosed] = useState(true);

    const openModal = (e) => {
        e.stopPropagation();
        setmodalIsClosed(!modalIsClosed);
    };


    return (
        <article>
            <div className="container">
                <div className="card editForm">
                    <header className='editForm-contentGroup editForm-contentGroup--row justify-sb'>
                        <h1>{data.heading}</h1>
                        <div className="editForm-contentGroup">
                            <label className='editForm-contentGroup' onClick={() => data.state.status.setVal(!data.state.status.val)}>
                                <div
                                    className={'customCheckbox' + (data.state.status.val ? ' checked' : '')}
                                >
                                    <i className="fa-solid fa-check checkbox-mark"></i>
                                </div>
                                <span className='noWrap'>Задача завершена</span>
                            </label>
                            {data.item &&
                                <Form action='remove' method='POST'>
                                    <button type='submit' className="fa-solid fa-trash deleteIcon"></button>
                                </Form>
                            }
                        </div>
                    </header>
                    <label className='editForm-contentGroup editForm-contentGroup--col'>
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
                    <label className='editForm-contentGroup editForm-contentGroup--col'>
                        <span>Описание:</span>
                        <textarea rows='6' value={data.state.description.val} onChange={(e) => data.state.description.setVal(e.target.value)} placeholder='Описание' name='description'></textarea>
                    </label>
                    <div className='editForm-contentGroup editForm-contentGroup--row'>
                        <div className="editForm-contentGroup editForm-contentGroup--col">
                            <span>Когда?</span>
                            <div className='inputWrap inputWrap--datapicker'>
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
                                        minDate: new Date().setHours(0, 0, 0, 0),
                                    }}
                                    onChange={([date]) => {
                                        data.state.targetDate.setVal(date.getTime());
                                    }}
                                />
                            </div>
                        </div>
                        <div className='editForm-contentGroup editForm-contentGroup--col'>
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
                    <footer className='editForm-contentGroup editForm-contentGroup--row editForm-btns justify-sb'>
                        <button type="button"
                            onClick={() => {
                                navigate(-1);
                            }} className='cancelBtn btn btn--colored'>Отменить</button>
                        <button type='submit' className='addBtn btn btn--colored' onClick={() => data.submitChanges()}>{data.saveBtnText}</button>
                    </footer>
                </div>
            </div>
        </article>
    )
}


class Categories extends Component {

    render() {
        return (
            <ul className='dropdownList'>
                {this.props.categories.map((category) =>
                    <li className='dropdownList-item' style={{ backgroundColor: category.color, color: category.textColor }} onClick={() => this.props.changeCategory(category.id)} key={category.id}>
                        <span>{category.name}</span>
                    </li>
                )
                }
            </ul>
        );
    }
}


const ModalCategories = useModal(Categories);


