'use strict';
import React, { Fragment } from 'react'
import { Form } from "react-router-dom";
import useTaskStatusesByDay from './useTaskStatuses';
import Scrollable from './scrollable';



export default function Categories({ year, categories, tasks, month, activeDate, tasksPeriod, removeCategory, changeActiveCategory, activeCategory }) {

    categories = categories.map((category) => {
        category.todayTasks = useTaskStatusesByDay({ year, month, day: activeDate, tasks, filterBy: { key: 'categoryId', value: category.id }, period: tasksPeriod });
        return category;
    });

    return (
        <section>
            <div className="container">
                <div className="card">
                    <h2 className='heading--standart'>Категории:</h2>
                    <Scrollable className='categories-container'>
                        {categories.map((category) =>
                            <Category
                                category={category}
                                key={category.id}
                                removeCategory={removeCategory}
                                changeActiveCategory={changeActiveCategory}
                                isActive={category.id == activeCategory}
                            />
                        )
                        }
                        <Form action='category'><button type="submit" className='categories-addBtn btn btn--transparent btn--add'>Добавить категорию</button></Form>
                    </Scrollable>
                </div>
            </div>
        </section>
    )
}

function Category(props) {
    let className = 'category scrollable-item';

    if (props.isActive) {
        className += ' activeCategory';
    };

    function handleCategoryClick(e) {
        if (e.target.classList.contains('category-delete')) {
            props.removeCategory(props.category.id);
        } else {
            props.changeActiveCategory(props.category.id);
        }
    };

    const style = { backgroundColor: props.category.color, pointerEvents: `${props.pointerEvents}` };
    if (props.category.textColor) {
        style.color = props.category.textColor;
    };

    return (
        <li
            className={className} style={style} onClick={(e) => handleCategoryClick(e)}
        >
            <div className="category-content">
                <span>{props.category.name}</span>
                {
                    props.category.todayTasks ?
                        <div className='tasksList'>
                            {Object.keys(props.category.todayTasks).map((key) =>
                            (
                                <span key={key + props.category.id + ''} className={'tasksNumber ' + `${key}TasksNumber`}>{props.category.todayTasks[key]}</span>
                            )
                            )}
                        </div>
                        : null
                }
            </div>
            {
                props.category.isCustom &&
                (
                    <div className='category-btns'>
                        <i className="fa-solid fa-trash category-delete deleteIcon" onClick={(e) => handleCategoryClick(e)}></i>
                        <Form action={`/category/${props.category.id}`}><button type="submit" className="fa-solid fa-pen-to-square editIcon"></button></Form>
                    </div>
                )
            }
        </li>
    )
}

