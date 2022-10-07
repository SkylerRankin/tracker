import { subDays, getDaysInMonth, differenceInDays } from 'date-fns';

export const getPastThreeWeekTestData = () => {
    return getResponses(21);
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
            value: Math.round(Math.random() * 10),
            notes: ""
        });
    }

    console.log(`getting responses, range ${new Date(responses[0].timestamp).toDateString()} - ${new Date(responses[responses.length - 1].timestamp).toDateString()}.`);

    return responses;
}