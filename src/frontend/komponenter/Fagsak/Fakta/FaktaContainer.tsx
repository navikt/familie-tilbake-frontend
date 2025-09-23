import type { Ytelsetype } from '../../../kodeverk';

import { Heading } from '@navikt/ds-react';
import * as React from 'react';

import { useFakta } from './FaktaContext';
import FaktaSkjema from './FaktaSkjema';
import { useBehandling } from '../../../context/BehandlingContext';
import { RessursStatus } from '../../../typer/ressurs';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { Spacer20 } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';

interface IProps {
    ytelse: Ytelsetype;
}

const FaktaContainer: React.FC<IProps> = ({ ytelse }) => {
    const { stegErBehandlet, skjemaData, fakta } = useFakta();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    if (fakta?.status === RessursStatus.Suksess) {
        return (
            <div className="py-4 mb-24 border-border-divider border-1 rounded-2xl px-6 bg-white">
                <Heading level="1" size="small">
                    Fakta om feilutbetaling
                </Heading>
                {(!erLesevisning || stegErBehandlet) && (
                    <>
                        <Steginformasjon
                            behandletSteg={stegErBehandlet}
                            infotekst="Kontroller at korrekt hendelse er satt"
                        />
                        <Spacer20 />
                    </>
                )}
                <FaktaSkjema
                    skjemaData={skjemaData}
                    fakta={fakta.data}
                    ytelse={ytelse}
                    erLesevisning={erLesevisning}
                />
            </div>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[fakta]} />;
    }
};

export default FaktaContainer;
