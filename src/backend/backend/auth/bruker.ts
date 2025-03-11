import type { TexasClient } from './texas';
import type { Userinfo } from '../../typer/entraid';
import type { NextFunction, Request, Response } from 'express';

import axios from 'axios';

import { logRequest } from '../utils';
import { utledAccessToken } from './tokenUtils';
import { retry } from '../../http';
import { LogLevel } from '../../logging/logging';
import { envVar } from '../../utils';

// Hent brukerprofil fra sesjon
export const hentBrukerprofil = () => {
    return async (req: Request, res: Response) => {
        if (!req.session) {
            throw new Error('Mangler sesjon på kall');
        }

        res.status(200).send(req.session.user);
    };
};

const fetchUserinfo = async (accessToken: string) => {
    const query = 'onPremisesSamAccountName,displayName,mail,officeLocation,userPrincipalName,id';

    return await axios.get<Userinfo>(`${envVar('GRAPH_API')}?$select=${query}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });
};

const hentBrukerdata = async (accessToken: string, req: Request) => {
    try {
        return retry(req, 'hente brukerdata', () => fetchUserinfo(accessToken));
    } catch (e: unknown) {
        logRequest(
            req,
            `Feilet mot ms graph: ${e}. Kan ikke fortsette uten brukerdata.`,
            LogLevel.Error
        );
        throw new Error(
            'Kunne ikke hente dine brukeropplysninger. Vennligst logg ut og inn på nytt'
        );
    }
};

/**
 * Funksjon som henter brukerprofil fra graph.
 */
export const setBrukerprofilPåSesjonRute = (texasClient: TexasClient) => {
    return async (req: Request, _: Response, next: NextFunction) => {
        await setBrukerprofilPåSesjon(texasClient, req, next);
    };
};

const setBrukerprofilPåSesjon = async (
    texasClient: TexasClient,
    req: Request,
    next: NextFunction
) => {
    const requestToken = utledAccessToken(req);
    if (!requestToken) {
        return next();
    }
    try {
        const accessToken = await texasClient.hentOnBehalfOfToken(
            requestToken,
            'https://graph.microsoft.com/.default'
        );
        const brukerdataResponse = await hentBrukerdata(accessToken, req);
        const brukerdata = brukerdataResponse.data;
        if (!req.session) {
            logRequest(req, 'Mangler sesjon på kall', LogLevel.Error);
            next();
        }

        req.session.user = {
            displayName: brukerdata.displayName,
            email: brukerdata.userPrincipalName,
            enhet: brukerdata.officeLocation.slice(0, 4),
            identifier: brukerdata.userPrincipalName,
            navIdent: brukerdata.onPremisesSamAccountName,
        };

        req.session.save((error: Error) => {
            if (error) {
                logRequest(
                    req,
                    `Feilet ved lagring av bruker på session: ${error}`,
                    LogLevel.Error
                );
            } else {
                return next();
            }
        });
    } catch (err: unknown) {
        logRequest(req, `Noe gikk galt: ${err}.`, LogLevel.Error);
        next();
    }
};
