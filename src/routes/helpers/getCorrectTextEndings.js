'use strict';

export default function getCorrectTextEndings({ qty, type, textsArr = null }) {
    const words = [" задача", " задачи", " задач"];
    const statusTexts = {
        active: ["активная", "активные", "активных"],
        done: ["выполненная", "выполненные", "выполненных"],
        failed: ["просроченная", "просроченные", "просроченных"],
    };
    let text = '';
    let texts = type ? [statusTexts[type], words] : textsArr ? [textsArr] : [words];
    texts.forEach((arr) => {
        text += arr[(qty % 100 > 4 && qty % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(qty % 10 < 5) ? Math.abs(qty) % 10 : 5]] || arr[2]
    });
    return text;
}