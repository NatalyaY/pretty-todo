'use strict';
import React from 'react';
import { UserContext } from '../userContext';
import getCorrectTextEndings from './helpers/getCorrectTextEndings';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
import variables from '../scss/_variables.scss';


function getDateText(date = new Date()) {
    return `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()}`
};


export default function Stat() {
    const { user } = React.useContext(UserContext);
    const [period, setPeriod] = React.useState('date');
    const [statDate, setStatDate] = React.useState(new Date());

    return (
        <section>
            <div className='container'>
                <div className='df align-center justify-sb stat-header'>
                    <h1>Ваша статистика</h1>
                    <div className="stat-periodBtns df df--center gap5">
                        <button
                            onClick={() => setPeriod('date')}
                            className={'link' + (period == 'date' ? ' active' : '')}
                        >
                            День
                        </button>
                        <button
                            onClick={() => setPeriod('week')}
                            className={'link' + (period == 'week' ? ' active' : '')}
                        >
                            Неделя
                        </button>
                        <button
                            onClick={() => setPeriod('month')}
                            className={'link' + (period == 'month' ? ' active' : '')}
                        >
                            Месяц
                        </button>
                        <button
                            onClick={() => setPeriod('all')}
                            className={'link' + (period == 'all' ? ' active' : '')}
                        >
                            Все время
                        </button>
                    </div>
                </div>
                <div className='df df--wrap justify-sb gap10'>
                    <div className='card tasksStat'>
                        <TaskStats tasks={user.tasks} period={period} periodDate={statDate} />
                    </div>
                    <div className='card bestDay'>
                        <BestDay tasks={user.tasks} />
                    </div>
                </div>
                <div className='card df chartContainer'>
                    <Chart tasks={user.tasks} setStatDate={setStatDate} />
                </div>
            </div>
        </section >
    )
}

function TaskStats({ tasks, period, periodDate }) {
    const statDate = new Date(periodDate.getTime());
    const monthsNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    const getMonday = (date = statDate) => {
        const dayNum = (date.getDay() + 6) % 7;
        return new Date(date.setDate(date.getDate() - dayNum));
    };

    const getSunday = (date = statDate) => {
        const dayNum = (7 - date.getDay()) % 7;
        return new Date(date.setDate(date.getDate() + dayNum));
    };

    const periodText =
        period == 'all' ? 'все время'
            : period == 'month' ? monthsNames[statDate.getMonth()]
                : period == 'week' ? `неделю ${getDateText(getMonday())}-${getDateText(getSunday())}`
                    : period == 'date' ? getDateText(statDate)
                        : '';

    const filterByPeriod = ({taskDate, beforeDateOrInDate = false, beforeDate = false}) => {
        let day = statDate;

        if (taskDate.getFullYear() != day.getFullYear()) {
            return false;
        };

        if (period == 'date') {
            taskDate = taskDate.setHours(0, 0, 0, 0);
            day = day.setHours(0, 0, 0, 0);
        } else if (period == 'week') {
            taskDate = getMonday(taskDate).setHours(0, 0, 0, 0);
            day = getMonday(day).setHours(0, 0, 0, 0);
        } else {
            taskDate = taskDate.getMonth();
            day = day.getMonth();
        };

        let result;

        if (beforeDateOrInDate) {
            result = taskDate <= day;
        } else if (beforeDate) {
            result = taskDate < day;
        } else {
            result = taskDate === day;
        };

        return result;
    };

    const getStatByTasks = () => {
        let createdTasks = [], doneTasks = [], overdueTasks = [], overdueDoneTasks = [];
        if (tasks.length) {
            if (period == 'all') {
                createdTasks = tasks;
                doneTasks = createdTasks.filter(task => (task.status == 'done') && (task.finishedDate <= task.targetDate));
                overdueTasks = createdTasks.filter(task => (task.status != 'done') && (statDate.setHours(0, 0, 0, 0) > task.targetDate));
                overdueDoneTasks = createdTasks.filter(task => (task.status == 'done') && (!task.doneInTime));
            } else {
                createdTasks = tasks.filter((task) => {
                    let taskCreationDate = new Date(task.creationDate);
                    return filterByPeriod({taskDate: taskCreationDate});
                });
                doneTasks = tasks.filter((task) => {
                    let taskFinishedDate = new Date(task.finishedDate);
                    return filterByPeriod({ taskDate: taskFinishedDate}) && (task.finishedDate <= task.targetDate);
                });
                overdueTasks = tasks.filter((task) => {
                    let taskTargetDate = new Date(task.targetDate);
                    return (statDate.setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0))
                        ? (task.status != 'done') && (Date.now() > task.targetDate)
                        : filterByPeriod({ taskDate: taskTargetDate}) && (task.status != 'done') && (Date.now() > task.targetDate);
                });
                overdueDoneTasks = tasks.filter((task) => {
                    let taskFinishedDate = new Date(task.finishedDate);
                    return filterByPeriod({ taskDate: taskFinishedDate }) && !task.doneInTime;
                });
            };
        };
        return { createdTasks: createdTasks.length, doneTasks: doneTasks.length, overdueTasks: overdueTasks.length, overdueDoneTasks: overdueDoneTasks.length };
    };

    const { createdTasks, doneTasks, overdueTasks, overdueDoneTasks } = getStatByTasks();
    const allActualTasksByDate = tasks.filter((task) => {
        let taskCreationDate = new Date(task.creationDate);
        let taskFinishedDate = new Date(task.finishedDate);

        return filterByPeriod({ taskDate: taskCreationDate, beforeDateOrInDate: true }) && !filterByPeriod({ taskDate: taskFinishedDate, beforeDate: true });
    });

    const createdTasksInfo = {
        mainText: createdTasks,
        mainTextAdditional: null,
        adiitionalText: 'задач',
        heading: 'Создано',
        fillPercent: null,
    };
    const doneTasksInfo = {
        mainText: `${Math.floor((doneTasks / allActualTasksByDate.length) * 100) || 0}`,
        mainTextAdditional: '%',
        adiitionalText: `${doneTasks} / ${allActualTasksByDate.length}`,
        heading: 'Выполнено',
        type: 'positive',
        fillPercent: `${Math.floor((doneTasks / allActualTasksByDate.length) * 100) || 0}`,
    };
    const overdueTasksInfo = {
        mainText: `${Math.floor((overdueTasks / allActualTasksByDate.length) * 100) || 0}`,
        mainTextAdditional: '%',
        adiitionalText: `${overdueTasks} / ${allActualTasksByDate.length}`,
        heading: 'Просрочено',
        type: 'negative',
        fillPercent: `${Math.floor((overdueTasks / allActualTasksByDate.length) * 100) || 0}`,

    };
    const overdueDoneTasksInfo = {
        mainText: `${Math.floor((overdueDoneTasks / allActualTasksByDate.length) * 100) || 0}`,
        mainTextAdditional: '%',
        adiitionalText: `${overdueDoneTasks} / ${allActualTasksByDate.length}`,
        heading: 'Выполнено с опозданием',
        type: 'negative',
        fillPercent: `${Math.floor((overdueDoneTasks / allActualTasksByDate.length) * 100) || 0}`,
    };


    return (
        <>
            <h2 className='mb20'>{`Успехи за ${periodText}`}</h2>
            <div className='taskStatsContainer'>
                {
                    [createdTasksInfo, doneTasksInfo, overdueTasksInfo, overdueDoneTasksInfo].map(el =>
                        <TaskStat key={el.heading} options={el} />
                    )
                }
            </div>
        </>
    )
}

function TaskStat({ options }) {
    const [fillLeft, setFillLeft] = React.useState(0);
    const [fillRight, setFillRight] = React.useState(0);

    const [mainText, setMainText] = React.useState(0);

    const rightStyle = { transform: `rotate(${-45 + fillLeft * 360 / 100}deg)` };
    const leftStyle = { transform: `rotate(${45 + fillRight * 360 / 100}deg)` };

    let styleType = Number(options.mainText) ? ` ${options.type || ''}` : '';

    const animate = ({ timing, draw, duration }) => {

        let start = performance.now();

        function animation(time) {
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;

            let progress = timing(timeFraction);

            draw(progress);

            if (progress < 1) {
                requestAnimationFrame(animation);
            };
        };
        requestAnimationFrame(animation);
    };

    const quad = (timeFraction) => {
        return Math.pow(timeFraction, 2)
    };

    const draw = (progress) => {
        const totalProgress = progress * options.fillPercent;
        if (totalProgress > 50) {
            setFillLeft(50);
            setFillRight(totalProgress - 50);
        } else {
            setFillLeft(totalProgress);
        };

        setMainText(Math.floor(progress * options.mainText));
    };

    React.useEffect(() => {
        if (options.fillPercent) {
            animate({ timing: quad, draw, duration: 1000 });
        };
        setFillLeft(0);
        setFillRight(0);
        setMainText(0);
    }, [options.adiitionalText]);


    return (
        <div className={'taskStatSquare' + `${styleType || ''}`}>
            <h3 className='taskStatHeading'>{options.heading}</h3>
            <div className='taskStatCircle mt10'>
                <p className='taskStatMainText'>{(options.fillPercent ? mainText : options.mainText) + options.mainTextAdditional}</p>
                <p className='taskStatAdditionalText'>{options.adiitionalText}</p>
                {
                    Number(options.fillPercent) &&
                    <>
                        <p className='taskStatMainTextHolder'>{options.mainText + options.mainTextAdditional}</p>
                        <div className="border-slice border-slice--right">
                            <div className="border-fill" style={rightStyle}></div>
                        </div>
                        {
                            options.fillPercent > 50 ?
                                <div className="border-slice border-slice--left">
                                    <div className="border-fill" style={leftStyle}></div>
                                </div>
                                : null
                        }
                    </>

                    || null
                }

            </div>
        </div>
    )
}

function BestDay({ tasks }) {

    const days = ['по Понедельникам', 'по Вторникам', 'по Средам', 'по Четвергам', 'по Пятницам', 'по Субботам', 'по Воскресеньям'];
    let maxCreatedAt, maxFinishedAt, bestDate, bestDateText, todayDoneTasks = [];

    if (tasks.length) {
        let createdTasksByDay = {}, doneTasksByDay = {}, doneTasksByDate = {};
        let todayDate = new Date();
        tasks.forEach((task) => {
            const creationDay = new Date(task.creationDate).getDay();
            createdTasksByDay[days[creationDay - 1]] = createdTasksByDay[days[creationDay - 1]] + 1 || 1;
            let taskTargetDate = new Date(task.targetDate);

            if ((taskTargetDate.setHours(0, 0, 0, 0) === todayDate.setHours(0, 0, 0, 0) && (task.status == 'done'))) {
                todayDoneTasks.push(task);
            };

            if (task.finishedDate) {
                const doneDay = new Date(task.finishedDate).getDay();
                const doneDate = new Date(task.finishedDate).setHours(0, 0, 0, 0);
                doneTasksByDay[days[doneDay - 1]] = doneTasksByDay[days[doneDay - 1]] + 1 || 1;
                doneTasksByDate[doneDate] = doneTasksByDate[doneDate] + 1 || 1;
            };

        });
        /* Sorting the object by the value of the key and returning the first key. */
        maxCreatedAt = Object.entries(createdTasksByDay).length ? Object.entries(createdTasksByDay).sort((a, b) => b[1] - a[1])[0][0] : null;
        maxFinishedAt = Object.entries(doneTasksByDay).length ? Object.entries(doneTasksByDay).sort((a, b) => b[1] - a[1])[0][0] : null;
        const bestDateWithQty = Object.entries(doneTasksByDate).length ? Object.entries(doneTasksByDate).sort((a, b) => b[1] - a[1])[0] : null;
        if (bestDateWithQty) {
            const todayStamp = todayDate.setHours(0, 0, 0, 0);
            bestDate = bestDateWithQty[0];
            const todayIsBestDateToo = Object.entries(doneTasksByDate).find(doneTask => (doneTask[1] === bestDateWithQty[1]) && (doneTask[0] == todayStamp));
            if ((bestDate == todayStamp) || todayIsBestDateToo) {
                bestDate = 'Сегодня';
                bestDateText = 'Так держать!';
            } else {
                bestDate = getDateText(new Date(+bestDate));
                const tasksQty = (bestDateWithQty[1] - todayDoneTasks.length) + 1;
                bestDateText = `Выполните еще ${tasksQty} ${getCorrectTextEndings({ qty: tasksQty, textsArr: [" задачу", " задачи", " задач"] })}, чтобы побить рекорд`;
            };
        };
    };

    return (
        <>
            <div>
                <h2 className='mb20'>Наблюдение</h2>
                {
                    (!maxCreatedAt && !maxFinishedAt) &&
                    <p>Нет данных</p>
                }
                {maxCreatedAt && <p><span>Больше всего задач вы создаете </span><span className='bold accent'>{maxCreatedAt}</span></p>}
                {maxFinishedAt && <p className='mt10'><span>Больше всего задач вы завершаете </span><span className='bold accent'>{maxFinishedAt}</span></p>}
            </div>
            <div>
                <h2 className='mb20 mt10'>Самый продуктивный день</h2>
                {
                    bestDate &&
                    <>
                        <p className='fz25 bold tac active mb5'>{bestDate}</p>
                        <p className='tac'>{bestDateText}</p>
                    </>
                    || <p>Нет данных</p>
                }
            </div>
        </>
    )

}

function Chart({ tasks, setStatDate }) {

    const creationDates = tasks.map(task => new Date(task.creationDate).setHours(0, 0, 0, 0));
    const doneDates = tasks.filter(task => task.finishedDate).map(task => new Date(task.finishedDate).setHours(0, 0, 0, 0));


    let minDate, maxDate;

    if (tasks.length) {
        minDate = Math.min(...creationDates.concat(doneDates));
        maxDate = Math.max(...creationDates.concat(doneDates));
    } else {
        maxDate = Date.now();
        minDate = new Date(maxDate).setDate(new Date(maxDate).getDate() - 6);
    };


    let labelDate = minDate, labels = [];

    while (labelDate <= maxDate) {
        labels.push(getDateText(new Date(labelDate)));
        labelDate = new Date(labelDate).setDate(new Date(labelDate).getDate() + 1);
    };

    const createdTasksData = tasks.length ? labels.map(label =>
        tasks.filter((task) => getDateText(new Date(task.creationDate)) == label).length || 0
    ) : [];

    const doneTasksData = tasks.length ? labels.map(label =>
        tasks.filter((task) => getDateText(new Date(task.finishedDate)) == label).length || 0
    ) : [];

    const basicPointRadius = 5;
    const clickedPointRadius = 7;
    const hoveredPointRadius = 7;

    const basicCreatedTasksBcc = variables.accentTransparent;
    const clickedCreatedTasksBcc = variables.accentTransparentClicked;

    const basicDoneTasksBcc = variables.accent;
    const clickedDoneTasksBcc = variables.accentClicked;

    const initialValues = {
        pointRadiuses: createdTasksData.map(() => basicPointRadius),
        doneTasksLine: {
            bcc: basicDoneTasksBcc,
            pointBcc: doneTasksData.map(() => basicDoneTasksBcc),
        },
        createdTasksLine: {
            bcc: basicCreatedTasksBcc,
            pointBcc: createdTasksData.map(() => basicCreatedTasksBcc),
        },
    };

    const [chartSettings, setChartSettings] = React.useState([initialValues]);

    let setInitialState = () => {
        setChartSettings([initialValues]);
        setStatDate(new Date());
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (e, activeEls) => {
            if (activeEls.length) {
                const elementIndex = activeEls[0].index;

                const date = labels[elementIndex];
                const splittedDate = date.split('.');
                const year = splittedDate.pop();
                const month = splittedDate.pop();
                const day = splittedDate.pop();
                const dateObj = new Date(+year, +month - 1, +day);

                const newSettings = JSON.parse(JSON.stringify(initialValues));
                newSettings.pointRadiuses[elementIndex] = clickedPointRadius;
                newSettings.doneTasksLine.bcc = clickedDoneTasksBcc;
                newSettings.doneTasksLine.pointBcc = newSettings.doneTasksLine.pointBcc.map(() => clickedDoneTasksBcc);
                newSettings.doneTasksLine.pointBcc[elementIndex] = basicDoneTasksBcc;

                newSettings.createdTasksLine.bcc = clickedCreatedTasksBcc;
                newSettings.createdTasksLine.pointBcc = newSettings.createdTasksLine.pointBcc.map(() => clickedCreatedTasksBcc);
                newSettings.createdTasksLine.pointBcc[elementIndex] = basicCreatedTasksBcc;

                setChartSettings(chartSettings.concat(newSettings));
                setStatDate(dateObj);

            } else {
                setInitialState();
            };
        },
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'График успеваемости',
                color: variables.accent,
                padding: {
                    bottom: 30,
                },
                align: 'start',
                font: {
                    size: variables.fzh2,
                    family: variables.font,
                    weight: 'bold',
                },
            },
        },
    };

    const plugins = [{
        id: 'myEventCatcher',
        beforeEvent(chart, args) {
            const event = args.event;
            if (event.type === 'mouseout') {
                document.addEventListener('click', setInitialState);
            } else if (event.type === 'mouseover') {
                document.removeEventListener('click', setInitialState);
            };
        },
    }]

    const data = {
        labels,
        datasets: [
            {
                label: 'Создано',
                data: createdTasksData,
                borderColor: chartSettings[chartSettings.length-1].createdTasksLine.bcc,
                backgroundColor: chartSettings[chartSettings.length - 1].createdTasksLine.bcc,
                cubicInterpolationMode: 'monotone',
                pointRadius: chartSettings[chartSettings.length - 1].pointRadiuses,
                pointHoverRadius: createdTasksData.map(() => hoveredPointRadius),
                pointBackgroundColor: chartSettings[chartSettings.length - 1].createdTasksLine.pointBcc,
            },
            {
                label: 'Выполнено',
                data: doneTasksData,
                borderColor: chartSettings[chartSettings.length - 1].doneTasksLine.bcc,
                backgroundColor: chartSettings[chartSettings.length - 1].doneTasksLine.bcc,
                cubicInterpolationMode: 'monotone',
                pointRadius: chartSettings[chartSettings.length - 1].pointRadiuses,
                pointHoverRadius: doneTasksData.map(() => hoveredPointRadius),
                pointBackgroundColor: chartSettings[chartSettings.length - 1].doneTasksLine.pointBcc,
            },
        ],
    };

    const chartRef = React.useRef();

    return (
        <Line options={options} data={data} ref={chartRef} plugins={plugins} />
    )
}


