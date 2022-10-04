'use strict';

import React, { useState, Component, useRef } from 'react'

export default class Scrollable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pointerEvents: 'all',
        };
        this.pageX = 0;
        this.ref = React.createRef();
        this.galleryScroll = this.galleryScroll.bind(this);
        this.pointerUp = this.pointerUp.bind(this);
        this.pointerDown = this.pointerDown.bind(this);
    }

    galleryScroll(e) {
        if (this.pageX !== 0) {
            const scroll = this.ref.current.scrollLeft + (this.pageX - e.pageX);
            this.ref.current.scrollLeft = scroll;
        };
        this.pageX = e.pageX;
        const state = Object.assign({}, this.state);
        state.pointerEvents = 'none';
        this.setState(state);
    }

    pointerUp() {
        this.pageX = 0;
        const state = Object.assign({}, this.state);
        state.pointerEvents = 'all';
        this.setState(state);
        document.removeEventListener('pointermove', this.galleryScroll);
        document.removeEventListener('pointerup', this.pointerUp);
    }

    pointerDown() {
        this.pageX = 0;
        document.addEventListener('pointermove', this.galleryScroll);
        document.addEventListener('pointerup', this.pointerUp);
    }

    componentDidMount() {
        const active = this.childrenWithProps.findIndex(child => child.props.isActive);
        if (this.activeChildIndex != active) {
            this.activeChildIndex = active;
            this.scrollToActiveChild();
        };
    }

    scrollToActiveChild() {
        if (this.activeChildIndex >= 0) {
            const childs = this.ref.current.children;
            const firstChild = childs[0];
            const activeChild = childs[this.activeChildIndex];
            const firstChildX = firstChild.getClientRects()[0].x;
            const activeChildX = activeChild.getClientRects()[0].x;
            const scrollLeft = this.ref.current.scrollLeft;
            const galleryWidth = this.ref.current.getClientRects()[0].width;
            const galleryTotalWidth = this.ref.current.scrollWidth;

            const activeChildWidth = activeChild.getClientRects()[0].width;

            let scrollX = (scrollLeft + activeChildX) - (scrollLeft + firstChildX) - (galleryWidth / 2) + (activeChildWidth / 2);
            if (scrollX > (galleryTotalWidth - galleryWidth)) {
                scrollX = galleryTotalWidth - galleryWidth;
            };
            this.ref.current.scrollLeft = scrollX;
        };
    }

    render() {
        this.childrenWithProps = React.Children.map(this.props.children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { pointerEvents: this.state.pointerEvents });
            }
            return child;
        });

        if (this.ref.current && this.pageX == 0) {
            const active = this.childrenWithProps.findIndex(child => child.props.isActive);
            if (this.activeChildIndex != active) {
                this.activeChildIndex = active;
                this.scrollToActiveChild();
            }
        };


        return (
            <div className={`scrollable-container ${this.props.className}`}>
                <ul
                    className='scrollable-list'
                    onDragStart={() => false}
                    onPointerDown={() => this.pointerDown()}
                    ref={this.ref}
                >
                    {this.childrenWithProps}
                </ul>
            </div>
        )
    }
}



