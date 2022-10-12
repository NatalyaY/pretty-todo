'use strict';

import React from 'react';
import {
    useNavigate,
    Form,
} from 'react-router-dom';
import useEditForm from './helpers/useEditForm';


export default function Category() {

    const data = useEditForm('category');
    const navigate = useNavigate();


    return (
        <article>
            <div className="container">
                <div className="card editForm">
                    <header className='editForm-contentGroup justify-sb'>
                        <h1>{data.heading}</h1>
                        {data.item &&
                            <Form action='remove' method='POST'>
                                <button type='submit' className="fa-solid fa-trash deleteIcon"></button>
                            </Form>
                        }
                    </header>
                    <div className='editForm-contentGroup editForm-contentGroup--row'>
                        <label className='editForm-contentGroup editForm-contentGroup--col'>
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
                        <label className='editForm-contentGroup editForm-contentGroup--col'>
                            <span>Цвет категории:</span>
                            <input type="color" value={data.state.color.val} onChange={(e) => data.state.color.setVal(e.target.value)} />
                        </label>
                    </div>
                    <footer className='editForm-contentGroup editForm-contentGroup--row editForm-btns justify-sb'>
                        <button type="button"
                            onClick={() => {
                                navigate(-1);
                            }} className='btn btn--colored cancelBtn'>Отменить</button>
                        <button type='submit' className='btn btn--colored addBtn' onClick={() => data.submitChanges()}>{data.saveBtnText}</button>
                    </footer>
                </div>
            </div>
        </article>
    )
}

