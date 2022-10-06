'use strict';
import React, { Component } from 'react';


export default function withModal(Element) {

    return class extends Component {

        constructor(props) {
            super(props);
            this.onClick = this.onClick.bind(this);
            this.scrollY = 0;
        }

        onClick() {
            this.props.callback();
            document.removeEventListener('click', this.onClick);
            document.documentElement.style.overflow = '';
            window.scrollTo(0, this.scrollY);
        };

        componentDidMount() {
            this.scrollY = window.scrollY;
            document.documentElement.style.overflow = 'hidden';
            document.addEventListener('click', this.onClick);
        }

        render() {
            const { callback, ...passThroughProps } = this.props;
            return (
                <div className='layer'>
                    <div className='popup'>
                        <i className="fa-solid fa-xmark closeIcon"></i>
                        <Element {...passThroughProps} />
                    </div>
                </div>
            )
        }
    }
}
