'use strict';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import './scss/index.scss';
import Error from './error';
import Layer from './layer';
import Main from './routes/mainPage';
import Stat from './routes/stat';
import Todos from './routes/todos';
import Task from './routes/task';
import Category from './routes/category';
import { removeAction, editAction } from './routes/helpers/API';



const router = createBrowserRouter([
    {
        path: '/',
        element: <Layer />,
        errorElement: <Error />,
        children: [
            {
                errorElement: <Error />,
                children: [
                    {
                        path: 'stat',
                        element: <Stat />,
                    },
                    {
                        index: true,
                        element: <Main />,
                    },
                    {
                        path: 'tasks',
                        element: <Todos />,
                    },
                    {
                        path: 'task/:taskId',
                        element: <Task />,
                        action: editAction,
                    },
                    {
                        path: 'task/:taskId/remove',
                        action: removeAction,
                    },
                    {
                        path: 'task',
                        element: <Task />,
                        action: editAction,
                    },
                    {
                        path: 'category/:categoryId',
                        element: <Category />,
                        action: editAction,
                    },
                    {
                        path: 'category/:categoryId/remove',
                        action: removeAction,
                    },
                    {
                        path: 'category',
                        element: <Category />,
                        action: editAction,
                    },
                ],
            },

        ],
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

