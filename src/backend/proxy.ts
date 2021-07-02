import { ClientRequest, IncomingMessage, OutgoingMessage } from 'http';

import { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { v4 as uuidv4 } from 'uuid';

import { Client, getOnBehalfOfAccessToken, IApi } from '@navikt/familie-backend';
import { logError, stdoutLogger } from '@navikt/familie-logging';

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
    return createProxyMiddleware('/familie-tilbake/api', {
        changeOrigin: true,
        logLevel: 'info',
        onProxyReq: restream,
        pathRewrite: (path: string, _req: Request) => {
            const newPath = path.replace('/familie-tilbake/api', '');
            return `/api${newPath}`;
        },
        secure: true,
        target: `${proxyUrl}`,
        logProvider: () => stdoutLogger,
    });
};

export const doRedirectProxy = () => {
    return (req: Request, res: Response) => {
        const urlKey = Object.keys(redirectRecords).find(k => req.originalUrl.includes(k));
        let newUrl;
        if (urlKey) {
            newUrl = req.originalUrl.replace(urlKey, redirectRecords[urlKey]);
            stdoutLogger.info(`Redirect ${urlKey} -> ${redirectRecords[urlKey]}`);
            res.redirect(newUrl);
        } else {
            console.log(`Ustøttet redirect: ${req.originalUrl}`);
            newUrl = req.originalUrl;
            res.sendStatus(404);
        }
    };
};

const pdfProxyUrlRecord: Record<string, string> = {
    '/familie-tilbake/api/pdf/behandling': '/api/behandling',
};

// eslint-disable-next-line
export const doPdfProxy: any = () => {
    return createProxyMiddleware('/familie-tilbake/api/pdf', {
        changeOrigin: true,
        logLevel: 'info',
        onProxyReq: restream,
        pathRewrite: (path: string, _req: Request) => {
            const urlKey = Object.keys(pdfProxyUrlRecord).find(k => path.includes(k));
            const newPath = urlKey ? path.replace(urlKey, pdfProxyUrlRecord[urlKey]) : path;
            return `${newPath}`;
        },
        secure: true,
        target: `${proxyUrl}`,
        logProvider: () => stdoutLogger,
        onProxyRes: (proxyRes, _, res) => {
            let dokumentData = '';
            const _end = res.end;
            res.write = () => true;
            proxyRes.on('data', chunk => {
                dokumentData += chunk;
            });

            res.end = () => {
                try {
                    let dataVises = 'Ukjent feil ved visning dokument';
                    let visfrontendFeilmelding = true;
                    JSON.parse(dokumentData, (k, v) => {
                        if ((k === 'data' || k === 'frontendFeilmelding') && v) {
                            dataVises = v;
                        }
                        if (k === 'data' && v) {
                            visfrontendFeilmelding = false;
                        }
                    });
                    res.setHeader('content-length', Buffer.byteLength(dataVises));
                    if (visfrontendFeilmelding) {
                        res.setHeader('content-encoding', 'utf-8');
                        res.setHeader('Content-Type', 'text/plain');
                        _end.call(res, dataVises, 'utf-8');
                    } else {
                        res.setHeader('content-encoding', 'base64');
                        res.setHeader('Content-Type', 'application/pdf');
                        _end.call(res, dataVises, 'base64');
                    }
                } catch (error) {
                    logError(`Proxying av pdf feilet: ${error}`);
                }
            };
        },
    });
};

// eslint-disable-next-line
export const doHistorikkApiProxy: any = () => {
    return createProxyMiddleware('/familie-historikk/api', {
        changeOrigin: true,
        logLevel: 'info',
        onProxyReq: restream,
        pathRewrite: (path: string, _req: Request) => {
            const newPath = path.replace('/familie-historikk/api', '');
            return `/api${newPath}`;
        },
        secure: true,
        target: `${historikkUrl}`,
        logProvider: () => stdoutLogger,
    });
};

// eslint-disable-next-line
export const doHistorikkStreamProxy: any = () => {
    return createProxyMiddleware('/familie-historikk/stream', {
        changeOrigin: true,
        logLevel: 'info',
        pathRewrite: (path: string, _req: Request) => {
            const newPath = path.replace('/familie-historikk/stream', '');
            return `/api${newPath}`;
        },
        secure: true,
        target: `${historikkUrl}`,
        logProvider: () => stdoutLogger,
    });
};

export const attachToken = (authClient: Client, oboConfig: IApi) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        getOnBehalfOfAccessToken(authClient, req, oboConfig).then((accessToken: string) => {
            req.headers['Nav-Call-Id'] = uuidv4();
            req.headers.Authorization = `Bearer ${accessToken}`;
            return next();
        });
    };
};
