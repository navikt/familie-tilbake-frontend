import type { TexasClient } from './backend/auth/texas';
import type { NextFunction, Request, Response } from 'express';
import type { ClientRequest, IncomingMessage, OutgoingMessage } from 'http';

import { createProxyMiddleware } from 'http-proxy-middleware';

import { getOnBehalfOfAccessToken } from './backend/auth/tokenUtils';
import { proxyUrl, redirectRecords } from './config';
import { stdoutLogger } from './logging/logging';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const restream = (proxyReq: ClientRequest, req: IncomingMessage, _res: OutgoingMessage): void => {
    const requestBody = (req as Request).body;
    if (requestBody) {
        const bodyData = JSON.stringify(requestBody);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
    }
};

// eslint-disable-next-line
export const doProxy: any = () => {
    return createProxyMiddleware({
        changeOrigin: true,
        on: { proxyReq: restream },
        secure: true,
        target: `${proxyUrl}`,
        logger: stdoutLogger,
    });
};

export const doRedirectProxy = () => {
    return (req: Request, res: Response) => {
        const urlKey = Object.keys(redirectRecords).find(k => req.originalUrl.includes(k));
        if (urlKey) {
            const basePath = redirectRecords[urlKey];
            const path = req.originalUrl.replace(urlKey, '');
            stdoutLogger.info(`Redirect ${urlKey} -> ${redirectRecords[urlKey]}`);
            res.redirect(basePath + path);
        } else {
            console.log(`Ustøttet redirect: ${req.originalUrl}`);
            res.sendStatus(404);
        }
    };
};

export const attachToken = (texasClient: TexasClient, scope: string) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        const accessToken = await getOnBehalfOfAccessToken(texasClient, req, scope);
        req.headers.Authorization = `Bearer ${accessToken}`;
        return next();
    };
};
