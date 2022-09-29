'use strict';
import React, { Component, Fragment } from 'react';
import { NavLink, Outlet } from 'react-router-dom';


export default class Layer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Fragment>
                <header>
                    <div className="container">
                        <ul>
                            <NavLink to='/' end>My todos</NavLink>
                            <NavLink to='/stat' end>My stat</NavLink>
                        </ul>
                    </div>
                </header>
                <main>
                    <Outlet />
                </main>
            </Fragment>
        )
    }
}
