import { z } from 'zod';

export const configureZod = (): void => {
    z.config({
        customError: issue => {
            if (issue.code === 'too_small' && issue.minimum == 1) return `Du må fylle inn en verdi`;
            if (issue.code === 'too_small') return `Du må fylle inn minst ${issue.minimum} tegn`;
            if (issue.code === 'too_big') return `Du må fylle inn færre enn ${issue.maximum} tegn`;
            if (issue.code === 'invalid_type' && issue.input === null)
                return 'Du må fylle inn en verdi';
            if (issue.code === 'invalid_format' && issue.format === 'date')
                return 'Du må skrive en dato på denne måten: dd.mm.åååå';

            return issue.message;
        },
    });
};
