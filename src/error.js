'use strict';
import React, { Fragment } from 'react';
import { useRouteError } from "react-router-dom";


function Error() {
    const error = useRouteError();
    return (
        <Fragment>
            <h1>Oops!</h1>
            <p>Something went wrong...</p>
            <p>{error.statusText || error.message || 'unknown error'}</p>
        </Fragment>
    )
}

export default Error;