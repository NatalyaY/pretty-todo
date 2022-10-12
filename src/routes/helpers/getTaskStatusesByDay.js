'use strict';

export default function getTaskStatusesByDay({year, month, day, tasks, filterBy = null, period}) {
    if (!tasks || !tasks.length) {
        return null;
    };

    const filteredTasks = (period != 'all') ? tasks.filter((task) => {
        const taskDate = typeof task.targetDate === 'string' ? new Date(Number(task.targetDate)) : new Date(task.targetDate);
        let dayDate = new Date(year, month, day);
        if (period == 'date') {
            const taskDateTime = taskDate.setHours(0, 0, 0, 0);
            dayDate = new Date(year, month, day).getTime();
            return taskDateTime === dayDate;
        };
        if (period == 'month') {
            const dateMonth = taskDate.getMonth();
            return dateMonth === dayDate.getMonth();
        };
    }) : tasks;

    let groupedTasks;

    if (filterBy) {
        groupedTasks = filteredTasks.filter(task => {
            if ((filterBy.key == 'categoryId') && (filterBy.value == 0)) {
                return true;
            } else {
                return task[filterBy.key] == filterBy.value;
            };
        });
    } else {
        groupedTasks = filteredTasks;
    };

    if (!groupedTasks.length) {
        return null;
    };

    return groupedTasks.reduce((acc, task) => {
        if ((Math.floor((task.targetDate - Date.now()) / 1000) <= 0) && task.status != 'done') {
            task.status = 'failed';
        };
        acc[task.status] = acc[task.status] + 1 || 1;
        return acc;
    }, {});
}