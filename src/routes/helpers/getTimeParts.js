'use strict';

export default function getTimeParts(ms) {
    const months = Math.floor(ms / (60 * 60 * 24 * 7 * 4));
    const weeks = Math.floor(ms % (60 * 60 * 24 * 7) / (60 * 60 * 24 * 7));
    const days = Math.floor(ms % (60 * 60 * 24 * 30) / (60 * 60 * 24));
    const hours = Math.floor(ms % (60 * 60 * 24) / (60 * 60));
    const minutes = Math.floor(ms % (60 * 60) / 60);
    const seconds = Math.ceil(ms % (60 * 60) % 60);
    return {months, weeks, days, hours, minutes, seconds};
}