import * as React from 'react';

import { Button, Modal, Select, Textarea } from '@navikt/ds-react';

import { useHenleggBehandlingSkjema } from './HenleggBehandlingModalContext';
import {
    Behandlingresultat,
    behandlingsresultater,
    IBehandling,
} from '../../../../../../typer/behandling';
import { IFagsak, målform } from '../../../../../../typer/fagsak';
import { Spacer20 } from '../../../../../Felleskomponenter/Flytelementer';
import { LabelMedSpråk } from '../../../../../Felleskomponenter/Skjemaelementer';
import ForhåndsvisHenleggelsesBrev from '../ForhåndsvisHenleggelsesbrev/ForhåndsvisHenleggelsesbrev';

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling]);

    const onChangeÅrsakskode = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const årsak = Behandlingresultat[e.target.value as keyof typeof Behandlingresultat];
        skjema.felter.årsakkode.validerOgSettFelt(årsak);
    };

    const visFritekst = erVisFritekst();
    const kanForhåndsvise = erKanForhåndsvise();

    return (
        <>
            {visModal && (
                <Modal
                    open
                    header={{ heading: 'Behandlingen henlegges', size: 'medium' }}
                    portal={true}
                    width="small"
                    onClose={() => {
                        nullstillSkjema();
                        settVisModal(false);
                    }}
                >
                    <Modal.Body>
                        <Select
                            {...skjema.felter.årsakkode.hentNavInputProps(skjema.visFeilmeldinger)}
                            label="Velg årsak"
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
                        </Select>
                        {visFritekst && (
                            <>
                                <Spacer20 />
                                <Textarea
                                    {...skjema.felter.fritekst.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    label={
                                        <LabelMedSpråk
                                            label="Fritekst til brev"
                                            språk={målform[fagsak.språkkode]}
                                        />
                                    }
                                    aria-label="Fritekst til brev"
                                    value={skjema.felter.fritekst.verdi || ''}
                                    onChange={event =>
                                        skjema.felter.fritekst.validerOgSettFelt(event.target.value)
                                    }
                                    readOnly={false}
                                    maxLength={1500}
                                />
                            </>
                        )}
                        <Spacer20 />
                        <Textarea
                            {...skjema.felter.begrunnelse.hentNavInputProps(
                                skjema.visFeilmeldinger
                            )}
                            label="Begrunnelse"
                            value={skjema.felter.begrunnelse.verdi || ''}
                            onChange={event =>
                                skjema.felter.begrunnelse.validerOgSettFelt(event.target.value)
                            }
                            readOnly={false}
                            maxLength={200}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <ForhåndsvisHenleggelsesBrev
                            key="forhåndsvis-henleggelsesbrev"
                            behandling={behandling}
                            skjema={skjema}
                            kanForhåndsvise={kanForhåndsvise}
                        />
                        <Button
                            variant="primary"
                            key="bekreft"
                            onClick={() => {
                                onBekreft();
                            }}
                            size="small"
                        >
                            Henlegg behandling
                        </Button>
                        <Button
                            variant="tertiary"
                            key="avbryt"
                            onClick={() => {
                                nullstillSkjema();
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default HenleggBehandlingModal;
