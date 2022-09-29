'use strict';
import React, { Component } from 'react';


export default function withModal(Element) {

    return class extends Component {

        constructor(props) {
            super(props);
            this.onClick = this.onClick.bind(this);
        }

        onClick(e) {
            this.props.callback();
            document.removeEventListener('click', this.onClick);
        };

        componentDidMount() {
            document.addEventListener('click', this.onClick);
        }

        render() {
            const { callback, ...passThroughProps } = this.props;
            return <Element {...passThroughProps}/>
        }
    }
}
