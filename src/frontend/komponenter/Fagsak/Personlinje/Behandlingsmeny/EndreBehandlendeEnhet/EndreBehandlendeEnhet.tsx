import * as React from 'react';

import KnappBase from 'nav-frontend-knapper';
import { SkjemaGruppe } from 'nav-frontend-skjema';

import { FamilieSelect } from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { Ytelsetype } from '../../../../../kodeverk';
import { IBehandling } from '../../../../../typer/behandling';
import { finnMuligeEnheter, IArbeidsfordelingsenhet } from '../../../../../typer/enhet';
import { hentFrontendFeilmelding } from '../../../../../utils/';
import { FTButton, Spacer8 } from '../../../../Felleskomponenter/Flytelementer';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';
import { FamilieTilbakeTextArea } from '../../../../Felleskomponenter/Skjemaelementer';
import { useEndreBehandlendeEnhet } from './EndreBehandlendeEnhetContext';

interface IProps {
    ytelse: Ytelsetype;
    behandling: IBehandling;
    onListElementClick: () => void;
}

const EndreBehandlendeEnhet: React.FC<IProps> = ({ ytelse, behandling, onListElementClick }) => {
    const [visModal, settVisModal] = React.useState<boolean>(false);
    const [behandendeEnheter, settBehandendeEnheter] = React.useState<IArbeidsfordelingsenhet[]>(
        []
    );
    const { behandlingILesemodus } = useBehandling();
    const { skjema, sendInn } = useEndreBehandlendeEnhet(behandling.behandlingId, () => {
        settVisModal(false);
    });

    React.useEffect(() => {
        settBehandendeEnheter(finnMuligeEnheter(ytelse));
    }, [ytelse]);

    return (
        <>
            <KnappBase
                mini={true}
                onClick={() => {
                    settVisModal(true);
                    onListElementClick();
                }}
                disabled={!behandling.kanEndres || behandlingILesemodus}
            >
                Endre behandlende enhet
            </KnappBase>

            <UIModalWrapper
                modal={{
                    tittel: 'Endre enhet for denne behandlingen',
                    visModal: visModal,
                    lukkKnapp: false,
                    actions: [
                        <FTButton
                            variant="tertiary"
                            key={'avbryt'}
                            onClick={() => {
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Avbryt
                        </FTButton>,
                        <FTButton
                            variant="primary"
                            disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                            key={'bekreft'}
                            onClick={() => sendInn()}
                            size="small"
                        >
                            Bekreft
                        </FTButton>,
                    ],
                }}
            >
                <SkjemaGruppe feil={hentFrontendFeilmelding(skjema.submitRessurs)}>
                    <FamilieSelect
                        {...skjema.felter.enhet.hentNavInputProps(skjema.visFeilmeldinger)}
                        erLesevisning={false}
                        name="enhet"
                        label={'Velg ny enhet'}
                        value={skjema.felter.enhet.verdi}
                        onChange={e => skjema.felter.enhet.validerOgSettFelt(e.target.value)}
                    >
                        <option value={''} disabled={true}>
                            Velg ny enhet
                        </option>
                        {behandendeEnheter.map(enhet => (
                            <option key={enhet.enhetId} value={enhet.enhetId}>
                                {enhet.enhetNavn}
                            </option>
                        ))}
                    </FamilieSelect>
                    <Spacer8 />
                    <FamilieTilbakeTextArea
                        {...skjema.felter.begrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                        label={'Begrunnelse'}
                        erLesevisning={false}
                        value={skjema.felter.begrunnelse.verdi}
                        onChange={e => skjema.felter.begrunnelse.validerOgSettFelt(e.target.value)}
                        maxLength={400}
                    />
                </SkjemaGruppe>
            </UIModalWrapper>
        </>
    );
};

export default EndreBehandlendeEnhet;
