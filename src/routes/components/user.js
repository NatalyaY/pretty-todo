'use strict';

import React from 'react';
import { UserContext } from '../../userContext';


export default function User() {
    const { user } = React.useContext(UserContext);

    return (
        <div className="user">
            <div className="userImgWrap userImgWrap--header">
                {
                    user.data.avatar ? <img className="userImg" src={user.data.avatar} alt="" /> : <svg className="userImg"><use href="../img/user.svg#avatarDefault" /></svg>
                }
            </div>
            {
                (user.data.name && user.data.name != ' ') && <p>{user.data.name || 'Гость'}</p>
            }
        </div>
    )
}