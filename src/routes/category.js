'use strict';

import React from 'react';
import {
    useNavigate,
    Form,
} from 'react-router-dom';
import useEditData from './components/edit';


export default function Category() {

    const data = useEditData('category');
    const navigate = useNavigate();


    return (
        <article>
            <div className="container edit-category">
                <header>
                    <h1>{data.heading}</h1>
                    {data.item &&
                        <Form action='remove' method='POST'>
                            <button type='submit' className="fa-solid fa-xmark"></button>
                        </Form>
                    }
                </header>
                <label className='edit-category-label'>
                    <span>Название категории:</span>
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
                        placeholder='Название категории'
                        name='name'
                        className={data.state.empty.val ? 'empty' : null}
                    />
                </label>
                <label className='edit-category-label'>
                    <span>Цвет категории:</span>
                    <input type="color" value={data.state.color.val} onChange={(e) => data.state.color.setVal(e.target.value)}/>
                </label>
                <footer className='edit-category-btns'>
                    <button type="button"
                        onClick={() => {
                            navigate(-1);
                        }} className='edit-category-cancel btn'>Отменить</button>
                    <button type='submit' className='edit-category-add btn' onClick={() => data.submitChanges()}>{data.saveBtnText}</button>
                </footer>
            </div>
        </article>
    )
}

