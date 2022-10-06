'use strict';
import React from 'react';
import { getUser as APIgetUser, editUser } from './routes/components/API';

export const UserContext = React.createContext({});

export function getUser() {
    return APIgetUser();
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = React.useState(getUser());

    function saveUser(userProp) {
        const newUser = { ...user, ...userProp };
        editUser(newUser);
        setUser(newUser);
    }

    return (
        <UserContext.Provider value={{ user, saveUser }}>
            {children}
        </UserContext.Provider>
    )
}