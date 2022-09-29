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
// var hexToHsl = require('hex-to-hsl');
import hexToHsl from 'hex-to-hsl';

export async function categoryAction({ request, params }) {
    const data = await request.formData();
    const updates = Object.fromEntries(data);

    const id = Number(params.categoryId) || null;
    if (id) {
        const category = API.getCategory(id);
        if (category) {
            updates.id = id;
            API.editCategory(updates);
        } else {
            API.addCategory(updates);
        };
    } else {
        API.addCategory(updates);
    };
    return redirect('/');
}

export async function removeCategory({ params }) {

    const id = Number(params.categoryId) || null;
    if (id) {
        API.removeCategory(id);
    };
    return redirect('/');
}

export function Category() {
    const id = Number(useParams().categoryId) || null;
    const category = API.getCategory(id);

    const heading = category ? 'Редактировать задачу' : 'Добавить новую категорию';
    const saveBtnText = category ? 'Сохранить' : 'Добавить';

    const [categoryName, setCategoryName] = useState(category?.name || '');
    const [categoryColor, setCategoryColor] = useState(category?.color || getRandomColor());

    const [emptyName, setEmptyName] = useState(false);
    const [validate, setValidate] = useState(false);

    function getRandomColor() {
        const rint = Math.floor(0x100000000 * Math.random());
        return '#' + ('00000' + rint.toString(16)).slice(-6).toUpperCase();
    };

    const navigate = useNavigate();
    const submit = useSubmit();

    function submitChanges() {
        setValidate(true);
        if (categoryName == '') {
            setEmptyName(true);
            return;
        };
        const category = {
            name: categoryName,
            color: categoryColor,
            isCustom: true,
        };

        if (hexToHsl(categoryColor)[2] <= 50) {
            category.textColor = '#FAFAFA';
        };
        submit(category, { method: "post", action: `/category/${id}` });
    };

    return (
        <article>
            <div className="container edit-category">
                <header>
                    <h1>{heading}</h1>
                    {category &&
                        <Form action='remove' method='POST'>
                            <button type='submit' className="fa-solid fa-xmark"></button>
                        </Form>
                    }
                </header>
                <label className='edit-category-label'>
                    <span>Название категории:</span>
                    <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => {
                            if ((e.target.value != '') && emptyName && validate) {
                                setEmptyName(false);
                            } else if (!emptyName && validate && (e.target.value == '')) {
                                setEmptyName(true);
                            };
                            setCategoryName(e.target.value);
                        }}
                        placeholder='Название категории'
                        name='name'
                        className={emptyName ? 'empty' : null}
                    />
                </label>
                <label className='edit-category-label'>
                    <span>Цвет категории:</span>
                    <input type="color" value={categoryColor} onChange={(e) => setCategoryColor(e.target.value)}/>
                </label>
                <footer className='edit-category-btns'>
                    <button type="button"
                        onClick={() => {
                            navigate(-1);
                        }} className='edit-category-cancel btn'>Отменить</button>
                    <button type='submit' className='edit-category-add btn' onClick={() => submitChanges()}>{saveBtnText}</button>
                </footer>
            </div>
        </article>
    )
}

