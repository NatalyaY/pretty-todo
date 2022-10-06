'use strict';

export default function getUser() {
    const user = window?.localStorage?.getItem('user') || {};

    return user;
};