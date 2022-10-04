'use strict';
import React, { Component, Fragment } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import Toggle from './routes/components/toggle';


export default class Layer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Fragment>
                <header>
                    <div className="container header-content">
                        <nav className='header-nav'>
                            <Link to='/'>
                                <img src="../img/logo.png" alt="Логотип" className='logo link--woUnderline'/>
                            </Link>
                            <div className="header-nav-pages">
                                <NavLink to='/tasks' end className='link'><i className="fa-regular fa-square-check header-nav-pages-icon"></i><span>Задачи</span></NavLink>
                                <NavLink to='/stat' end className='link'><i className="fa-solid fa-chart-simple header-nav-pages-icon"></i> <span>Статистика</span></NavLink>
                            </div>
                        </nav>
                        <Toggle />
                    </div>
                </header>
                <main>
                    <Outlet />
                </main>
            </Fragment>
        )
    }
}
