import { subDays, getDaysInMonth, differenceInDays } from 'date-fns';

export const getTestData = () => {
    return [
        { timestamp: 1665458474000, value: 1 }, // today
        { timestamp: 1665372074000, value: 2 },
        { timestamp: 1665285674000, value: 3 },
        { timestamp: 1665199274000, value: 4 },
        { timestamp: 1665112874000, value: 5 },
    ];
}

export const getPastThreeWeekTestData = () => {
    return getResponses(21);
}

export const getPastThreeWeekGappedTestData = () => {
    const threeWeeks = getResponses(21);
    threeWeeks.splice(7, 10);
    return threeWeeks;
}

export const getLargeTestData = () => {
    return getResponses(123);
}

const getResponses = (count) => {
    const today = new Date();
    const responses = [];
    for (let i = count - 1; i >= 0; i--) {
        responses.push({
            timestamp: subDays(today, i).getTime(),
            value: Math.floor(Math.random() * 10) + 1,
            notes: Math.random() < 0.1 ? `a blank note from the test data, ${i}` : ""
        });
    }

    return responses;
}