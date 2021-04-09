export const dayIn21Days = () => {
    const dayIn21Days = new Date();
    dayIn21Days.setDate(dayIn21Days.getDate() + 21);
    return dayIn21Days.toISOString().substring(0, 10);
};

export const yesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().substring(0, 10);
};
