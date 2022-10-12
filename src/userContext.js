'use strict';
import React from 'react';
import * as API from './routes/helpers/API';

export const UserContext = React.createContext({});


export const UserProvider = ({ children }) => {
    const [user, setUser] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(true);


    React.useEffect(() => {
        getUser();
        API.subscribe(getUser);
        return () => API.unSubscribe(getUser);
    }, []);

    const getUser = () => {
        const user = API.getUser();
        setUser(user);
        setIsLoading(false);
    }

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {
                isLoading && <i className="fa-solid fa-spinner fa-spin spinner"></i> || children
            }
        </UserContext.Provider>
    )
}