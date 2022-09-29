'use strict';

export default function useTaskStatusesByDay(year, month, day, tasks, filterBy = null, period = true) {
    if (!tasks || !tasks.length) {
        return null;
    };

    const filteredTasks = period ? tasks.filter((task) => {
        const date = typeof task.targetDate === 'string' ? new Date(Number(task.targetDate)).setHours(0, 0, 0, 0) : new Date(task.targetDate).setHours(0, 0, 0, 0);
        const dayDate = new Date(year, month, day).getTime();
        return date === dayDate;
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
        acc[task.status] = acc[task.status] + 1 || 1;
        return acc;
    }, {});
}