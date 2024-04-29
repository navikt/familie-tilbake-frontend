import { ClientRequest, IncomingMessage, OutgoingMessage } from 'http';

import { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { Client, getOnBehalfOfAccessToken, IApi } from '@navikt/familie-backend';
import { stdoutLogger } from '@navikt/familie-logging';

import { proxyUrl, historikkUrl, redirectRecords } from './config';

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
    console.log('Lager proxy');
    stdoutLogger.info('Lager proxy2');
    return createProxyMiddleware({
        changeOrigin: true,
        on: { proxyReq: restream },
        secure: true,
        pathRewrite: (path: string) => {
            stdoutLogger.info('Hallo');
            console.log('Hallo2');
            return path;
        },
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

// eslint-disable-next-line
export const doHistorikkApiProxy: any = () => {
    return createProxyMiddleware({
        changeOrigin: true,
        on: { proxyReq: restream },
        secure: true,
        target: `${historikkUrl}`,
        logger: stdoutLogger,
    });
};

// eslint-disable-next-line
export const doHistorikkStreamProxy: any = () => {
    return createProxyMiddleware({
        changeOrigin: true,
        secure: true,
        target: `${historikkUrl}`,
        logger: stdoutLogger,
    });
};

export const attachToken = (authClient: Client, oboConfig: IApi) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        console.log('Setter token!!!');
        getOnBehalfOfAccessToken(authClient, req, oboConfig).then((accessToken: string) => {
            req.headers.Authorization = `Bearer ${accessToken}`;
            return next();
        });
    };
};
