import * as React from 'react';

import { Flatknapp, Knapp } from 'nav-frontend-knapper';

import { FamilieSelect } from '@navikt/familie-form-elements';

import {
    Behandlingresultat,
    behandlingsresultater,
    IBehandling,
} from '../../../../../../typer/behandling';
import { IFagsak, målform } from '../../../../../../typer/fagsak';
import { Spacer20 } from '../../../../../Felleskomponenter/Flytelementer';
import UIModalWrapper from '../../../../../Felleskomponenter/Modal/UIModalWrapper';
import {
    FamilieTilbakeTextArea,
    LabelMedSpråk,
} from '../../../../../Felleskomponenter/Skjemaelementer';
import ForhåndsvisHenleggelsesBrev from '../ForhåndsvisHenleggelsesbrev/ForhåndsvisHenleggelsesbrev';
import { useHenleggBehandlingSkjema } from './HenleggBehandlingModalContext';

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    visModal: boolean;
    settVisModal: (vis: boolean) => void;
    årsaker: Behandlingresultat[];
}

const HenleggBehandlingModal: React.FC<IProps> = ({
    behandling,
    fagsak,
    visModal,
    settVisModal,
    årsaker,
}) => {
    const { skjema, erVisFritekst, onBekreft, nullstillSkjema, erKanForhåndsvise } =
        useHenleggBehandlingSkjema({ behandling, settVisModal });

    React.useEffect(() => {
        skjema.felter.behandlingstype.onChange(behandling.type);
    }, [behandling]);

    const onChangeÅrsakskode = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const årsak = Behandlingresultat[e.target.value as keyof typeof Behandlingresultat];
        skjema.felter.årsakkode.validerOgSettFelt(årsak);
    };

    const visFritekst = erVisFritekst();
    const kanForhåndsvise = erKanForhåndsvise();

    return (
        <UIModalWrapper
            modal={{
                tittel: 'Behandlingen henlegges',
                visModal: visModal,
                lukkKnapp: false,
                actions: [
                    <ForhåndsvisHenleggelsesBrev
                        key={'forhåndsvis-henleggelsesbrev'}
                        behandling={behandling}
                        skjema={skjema}
                        kanForhåndsvise={kanForhåndsvise}
                    />,
                    <Flatknapp
                        key={'avbryt'}
                        mini={true}
                        onClick={() => {
                            nullstillSkjema();
                            settVisModal(false);
                        }}
                    >
                        Avbryt
                    </Flatknapp>,
                    <Knapp
                        key={'bekreft'}
                        onClick={() => {
                            onBekreft();
                        }}
                        type={'hoved'}
                        mini={true}
                    >
                        Henlegg behandling
                    </Knapp>,
                ],
            }}
            style={{
                content: {
                    width: '36rem',
                },
            }}
        >
            <>
                <FamilieSelect
                    {...skjema.felter.årsakkode.hentNavInputProps(skjema.visFeilmeldinger)}
                    label={`Velg årsak`}
                    onChange={e => onChangeÅrsakskode(e)}
                >
                    <option value="" disabled={true}>
                        Velg årsak til henleggelse
                    </option>
                    {årsaker.map(årsak => (
                        <option key={årsak} value={årsak}>
                            {behandlingsresultater[årsak]}
                        </option>
                    ))}
                </FamilieSelect>
                {visFritekst && (
                    <>
                        <Spacer20 />
                        <FamilieTilbakeTextArea
                            {...skjema.felter.fritekst.hentNavInputProps(skjema.visFeilmeldinger)}
                            label={
                                <LabelMedSpråk
                                    label={`Fritekst til brev`}
                                    språk={målform[fagsak.språkkode]}
                                />
                            }
                            aria-label={`Fritekst til brev`}
                            value={skjema.felter.fritekst.verdi || ''}
                            onChange={event =>
                                skjema.felter.fritekst.validerOgSettFelt(event.target.value)
                            }
                            erLesevisning={false}
                            maxLength={1500}
                        />
                    </>
                )}
                <Spacer20 />
                <FamilieTilbakeTextArea
                    {...skjema.felter.begrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                    label={`Begrunnelse`}
                    value={skjema.felter.begrunnelse.verdi || ''}
                    onChange={event =>
                        skjema.felter.begrunnelse.validerOgSettFelt(event.target.value)
                    }
                    erLesevisning={false}
                    maxLength={200}
                />
            </>
        </UIModalWrapper>
    );
};

export default HenleggBehandlingModal;
