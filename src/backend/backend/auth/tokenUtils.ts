import type { Request } from 'express';

export const tokenSetSelfId = 'self';

export const utledAccessToken = (req: Request) => {
    if (!req.headers.authorization?.startsWith('Bearer ')) {
        return false;
    }
    return req.headers.authorization.substring(7);
};
