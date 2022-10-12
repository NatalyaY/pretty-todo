'use strict';
import React from 'react';

export default function useModal(Element) {

    return function(props) {
        const { callback, ...passThroughProps } = props;
        let scrollY = 0;

        React.useEffect(() => {
            scrollY = window.scrollY;
            document.documentElement.style.overflow = 'hidden';
            document.addEventListener('click', props.callback);

            return () => {
                document.removeEventListener('click', props.callback);
                document.documentElement.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }, []);

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