import type { User } from '../typer';
import type { TexasClient } from './texas';
import type { Userinfo } from '../../typer/entraid';
import type { AxiosResponse } from 'axios';
import type { Request, Response } from 'express';

import axios from 'axios';

import { appConfig } from '../../config';
import { retry } from '../../http';
import { LogLevel } from '../../logging/logging';
import { logRequest } from '../utils';
import { utledAccessToken } from './authenticate';

export const hentBrukerprofil = (texasClient: TexasClient) => {
    return async (req: Request, res: Response): Promise<void> => {
        const requestToken = utledAccessToken(req);
        if (!requestToken) {
            res.sendStatus(401);
            return;
        }

        if (!req.session.user) {
            req.session.user = await setBrukerprofilPåSesjon(texasClient, req, requestToken);
        }

        res.status(200).send(req.session.user);
    };
};

const fetchUserinfo = async (accessToken: string): Promise<AxiosResponse<Userinfo>> => {
    const query = 'onPremisesSamAccountName,displayName,mail,officeLocation,userPrincipalName,id';

    return await axios.get<Userinfo>(`${appConfig.graphApiUrl}?$select=${query}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });
};

const hentBrukerdata = async (
    accessToken: string,
    req: Request
): Promise<AxiosResponse<Userinfo>> => {
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

const setBrukerprofilPåSesjon = async (
    texasClient: TexasClient,
    req: Request,
    requestToken: string
): Promise<User | null> => {
    try {
        const accessToken = await texasClient.hentOnBehalfOfToken(
            requestToken,
            'https://graph.microsoft.com/.default'
        );
        const brukerdataResponse = await hentBrukerdata(accessToken, req);
        const brukerdata = brukerdataResponse.data;

        return {
            displayName: brukerdata.displayName,
            email: brukerdata.userPrincipalName,
            enhet: brukerdata.officeLocation.slice(0, 4),
            identifier: brukerdata.userPrincipalName,
            navIdent: brukerdata.onPremisesSamAccountName,
        };
    } catch (err: unknown) {
        logRequest(req, `Noe gikk galt: ${err}.`, LogLevel.Error);
        throw err;
    }
};
