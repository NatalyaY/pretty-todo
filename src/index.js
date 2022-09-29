'use strict';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {
    createBrowserRouter,
    RouterProvider,
    Route,
} from "react-router-dom";
import './index.scss';
import Error from './error';
import Layer from './layer';
import Stat from './routes/stat';
import { TodosWithSubscription, action} from './routes/todos';
import {Task, action as editAction, removeAction} from './routes/task';
import { Category, categoryAction, removeCategory } from './routes/category';



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
                        element: <TodosWithSubscription />,
                        action: action,
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
                        action: categoryAction,
                    },
                    {
                        path: 'category/:categoryId/remove',
                        action: removeCategory,
                    },
                    {
                        path: 'category',
                        element: <Category />,
                        action: categoryAction,
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

