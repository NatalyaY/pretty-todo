'use strict';
import React from 'react';
import { useRouteError } from "react-router-dom";


function Error() {
    const error = useRouteError();
    return (
        <section>
            <div className="container">
                <div className="card">
                    <h1>Oops!</h1>
                    <p>Something went wrong...</p>
                    <p>{error.statusText || error.message || 'unknown error'}</p>
                </div>
            </div>
        </section>
    )
}

export default Error;