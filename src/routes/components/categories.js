'use strict';
import React, { Fragment } from 'react'
import {
    Form
} from "react-router-dom";

function Categories({ categories, removeCategory, changeActiveCategory, activeCategory }) {
    return (
        <section>
            <div className="container">
                <ul className='todo-categories'>
                    {categories.map((category) =>
                        <Category category={category} key={category.id} removeCategory={removeCategory} changeActiveCategory={changeActiveCategory} activeCategory={activeCategory} />
                    )
                    }
                    <Form action='category'><button type="submit">Добавить категорию</button></Form>
                </ul>
            </div>
        </section>
    )
}

function Category({ category, removeCategory, changeActiveCategory, activeCategory }) {
    let className = 'todo-categories-category';

    if (category.id == activeCategory) {
        className += ' active';
    };

    function handleCategoryClick(e) {
        if (e.target.classList.contains('todo-categories-category-delete')) {
            removeCategory(category.id);
        } else {
            changeActiveCategory(category.id);
        }
    };

    const style = { backgroundColor: category.color };
    if (category.textColor) {
        style.color = category.textColor;
    };

    return (
        <li
            className={className} style={style} onClick={(e) => handleCategoryClick(e)}
        >
            <span>{category.name}</span>
            {
                category.todayTasks ?
                    <div className='todo-categories-category-tasks'>
                        {Object.keys(category.todayTasks).map((key) =>
                        (
                            <span key={key + category.id + ''} className={'category-tasks ' + key}>{category.todayTasks[key]}</span>
                        )
                        )}
                    </div>
                    : null
            }
            {
                category.isCustom &&
                (
                    <div>
                        <i className="fa-solid fa-xmark todo-categories-category-delete" onClick={(e) => handleCategoryClick(e)}></i>
                        <Form action={`/category/${category.id}`}><button type="submit" className="fa-solid fa-pen-to-square todo-task-edit"></button></Form>
                    </div>
                )
            }
        </li>
    )
}


export default Categories;

