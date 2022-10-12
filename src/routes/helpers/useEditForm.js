'use strict';
import { useState } from 'react';
import {
    useParams,
    useSubmit,
} from 'react-router-dom';
import * as API from './API';
import hexToHsl from 'hex-to-hsl';


export default function useEditForm(type) {
    const id = (type == 'category') ? Number(useParams().categoryId) || null : Number(useParams().taskId) || null;
    const headingText = (type == 'task') ? 'задачу' : 'категорию';

    const item = (type == 'category') ? API.getCategory(id) : API.getTask(id);

    const heading = item ? `Редактировать ${headingText}` : `Добавить новую ${headingText}`;
    const saveBtnText = item ? 'Сохранить' : 'Добавить';

    const data = {
        id,
        item,
        heading,
        saveBtnText,
        state: {},
    };

    let itemTemplate = ['name'];
    if (type == 'category') {
        itemTemplate = itemTemplate.concat(['color']);
    } else {
        itemTemplate = itemTemplate.concat(['categoryId', 'description', 'status', 'targetDate']);
    };

    itemTemplate.forEach((key) => {
        let initialVal = item ? item[key] || '' : '';
        if (key == 'targetDate') {
            initialVal = item?.targetDate || new Date().setHours(23, 59, 59, 999)
        } else if (key == 'status') {
            initialVal = item?.status == 'done' ? true : false || false;
        } else if (key == 'color') {
            initialVal = item?.color || getRandomColor()
        };
        const [val, setVal] = useState(initialVal);
        data.state[key] = { val, setVal };
    });

    function getRandomColor() {
        const rint = Math.floor(0x100000000 * Math.random());
        return '#' + ('00000' + rint.toString(16)).slice(-6).toUpperCase();
    };

    const [emptyName, setEmptyName] = useState(false);
    const [validate, setValidate] = useState(false);
    data.state.empty = { val: emptyName, setVal: setEmptyName };
    data.state.validate = { val: validate, setVal: setValidate };

    const submit = useSubmit();

    data.submitChanges = () => {
        data.state.validate.setVal(true);

        if (data.state.name.val == '') {
            data.state.empty.setVal(true);
            return;
        };

        const updates = {};

        Object.keys(data.state).forEach((key) => {
            if ((key != 'empty') && (key != 'validate')) {
                let value = data.state[key].val;
                if (key == 'status') {
                    value = data.state[key].val ? 'done' : 'active';
                };
                updates[key] = value;
            };
        });

        if (type == 'category') {
            updates.textColor = (hexToHsl(updates.color)[2] <= 50) ? '#FAFAFA' : 'black';
            updates.isCustom = true;
        };

        submit(updates, { method: "post", action: `/${type}/${id}` });
    };

    return data;
}