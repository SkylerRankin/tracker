import { subDays } from 'date-fns';

export const getTestData = () => {
    return [
        { timestamp: 1665458474000, value: 1 }, // end date
        { timestamp: 1665372074000, value: 2 },
        { timestamp: 1665285674000, value: 3 },
        { timestamp: 1665199274000, value: 4 },
        { timestamp: 1665112874000, value: 5 },
    ];
}

export const getPastThreeWeekTestData = () => {
    return getResponses(21, 0, 3);
}

export const getPastThreeWeekGappedTestData = () => {
    const threeWeeks = getResponses(21, 0, 1);
    threeWeeks.splice(7, 10);
    return threeWeeks;
}

export const getLargeTestData = () => {
    return getResponses(500, 0, 1);
}

const getResponses = (count, offsetFromToday, responsesPerDay) => {
    const today = new Date();
    const responses = [];
    for (let i = count + offsetFromToday - 1; i >= offsetFromToday; i--) {
        const base = Math.floor(Math.random() * 10) + 1;
        for (let j = 0; j < responsesPerDay; j++) {
            const offset = Math.random() < 0.34;
            const value = offset ? Math.min(Math.max(base + 1 - Math.floor(Math.random() * 5), 1), 10) : base;
            responses.push({
                timestamp: subDays(today, i).getTime(),
                value,
                notes: ""
            });
        }
    }

    return responses;
}