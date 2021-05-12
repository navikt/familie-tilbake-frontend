import { Behandlingssteg } from '../../../frontend/typer/behandling';
import { ITotrinnkontroll } from '../../../frontend/typer/totrinnTyper';

const totrinn_1: ITotrinnkontroll = {
    totrinnsstegsinfo: [
        {
            behandlingssteg: Behandlingssteg.FAKTA,
        },
        {
            behandlingssteg: Behandlingssteg.FORELDELSE,
        },
        {
            behandlingssteg: Behandlingssteg.VILKÅRSVURDERING,
        },
        {
            behandlingssteg: Behandlingssteg.FORESLÅ_VEDTAK,
        },
    ],
};

export { totrinn_1 };
