'use strict';

import React, { useState, useEffect } from 'react'

export default function Scrollable(props) {
    const [pointerEvents, setPointerEvents] = useState('all');
    const [childrenWithProps, setChildrenWithProps] = useState(null);
    const [ref] = useState(React.useRef());
    const [activeChildIndex, setActiveChildIndex] = useState(null);
    let pageX = 0;

    const galleryScroll = (e) => {
        if (pageX !== 0) {
            const scroll = ref.current.scrollLeft + (pageX - e.pageX);
            ref.current.scrollLeft = scroll;
        };
        pageX = e.pageX;
        setPointerEvents('none');
    };

    const pointerUp = () => {
        pageX = 0;
        setPointerEvents('all')
        document.removeEventListener('pointermove', galleryScroll);
        document.removeEventListener('pointerup', pointerUp);
    };

    const pointerDown = () => {
        pageX = 0;
        document.addEventListener('pointermove', galleryScroll);
        document.addEventListener('pointerup', pointerUp);
    };

    const scrollToActiveChild = () => {
        if (activeChildIndex >= 0) {
            const childs = ref.current.children;
            const firstChild = childs[0];
            const activeChild = childs[activeChildIndex];
            const firstChildX = firstChild.getClientRects()[0].x;
            const activeChildX = activeChild.getClientRects()[0].x;
            const scrollLeft = ref.current.scrollLeft;
            const galleryWidth = ref.current.getClientRects()[0].width;
            const galleryTotalWidth = ref.current.scrollWidth;

            const activeChildWidth = activeChild.getClientRects()[0].width;

            let scrollX = (scrollLeft + activeChildX) - (scrollLeft + firstChildX) - (galleryWidth / 2) + (activeChildWidth / 2);
            if (scrollX > (galleryTotalWidth - galleryWidth)) {
                scrollX = galleryTotalWidth - galleryWidth;
            };
            ref.current.scrollLeft = scrollX;
        };
    };

    useEffect(() => {
        const children = React.Children.map(props.children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { pointerEvents: pointerEvents });
            };
            return child;
        });
        setChildrenWithProps(children);
    }, [props.children, pointerEvents]);

    useEffect(() => {
        if (!childrenWithProps) return;
        const active = childrenWithProps.findIndex(child => child.props.isActive);
        if (activeChildIndex != active) {
            setActiveChildIndex(active);
        };
    }, [childrenWithProps]);

    useEffect(() => {
        if (activeChildIndex != null) {
            scrollToActiveChild();
        };
    }, [activeChildIndex]);

    return (
        <div className={`scrollable-container ${props.className}`}>
            <ul
                className='scrollable-list'
                onDragStart={() => false}
                onPointerDown={() => pointerDown()}
                ref={ref}
            >
                {childrenWithProps}
            </ul>
        </div>
    )
}



