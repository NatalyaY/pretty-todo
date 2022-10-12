'use strict';
import React, { Component } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import Toggle from './routes/components/toggle';
import { UserProvider } from './userContext';
import User from './routes/components/user';

export default class Layer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            menuMobileChecked: false,
        };
        this.onChange = this.onChange.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    onChange(e) {
        e.stopPropagation();
        if (!this.state.menuMobileChecked) {
            document.addEventListener('click', this.onClick);
            this.setState({ menuMobileChecked: true });
        } else {
            this.setState({ menuMobileChecked: false });
        }
    }

    onClick(e) {
        e.preventDefault();
        document.removeEventListener('click', this.onClick);
        this.setState({ menuMobileChecked: false });
    }

    render() {
        return (
            <UserProvider>
                <header>
                    <div className="container header-content">
                        <nav className='header-nav'>
                            <Link to='/' className='logoLink'>
                                <img src="../img/logo.png" alt="Логотип" className='logo link--woUnderline' />
                            </Link>
                            <input type="checkbox" hidden id='menuMobile' name='menuMobile' onChange={(e) => this.onChange(e)} checked={this.state.menuMobileChecked} />
                            <label htmlFor='menuMobile'>
                                <div className="nav-burger"></div>
                            </label>
                            <div className="header-nav-pages">
                                <NavLink to='/tasks' end className='link nowrap'><i className="fa-regular fa-square-check header-nav-pages-icon"></i><span>Задачи</span></NavLink>
                                <NavLink to='/stat' end className='link nowrap'><i className="fa-solid fa-chart-simple header-nav-pages-icon"></i> <span>Статистика</span></NavLink>
                            </div>
                        </nav>
                        <Toggle />
                        <Link to='/' className='link--woUnderline'>
                            <User />
                        </Link>
                    </div>
                </header>
                <main>
                    <Outlet />
                </main>
            </UserProvider >
        )
    }
}
