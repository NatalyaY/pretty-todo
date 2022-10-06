'use strict';

import React from 'react';
import {UserContext} from '../../userContext';


export default function User() {
    return (
        <UserContext.Consumer>
            {({ user }) =>
                <div className="user">
                    <div className="userImgWrap userImgWrap--header">
                        {
                            user.avatar ? <img className="userImg" src={user.avatar} alt="" /> : <svg className="userImg"><use href="../img/user.svg#avatarDefault" /></svg>
                        }
                    </div>
                    {
                        (user.name && user.name!= ' ') && <p>{user.name || 'Гость'}</p>
                    }
                </div>
            }
        </UserContext.Consumer>
    )
}