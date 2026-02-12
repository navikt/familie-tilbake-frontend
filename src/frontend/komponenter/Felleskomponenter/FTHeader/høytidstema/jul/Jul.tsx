import React from 'react';

import christmasCandle from './christmasCandle.svg';
import stars from './stars.svg';
import { Image } from '../../../Image/Image';

const beregnAntallAdventslys = (): number => {
    const iDag = new Date();
    const år = iDag.getFullYear();
    const førsteJuldag = new Date(år, 11, 25); // 25. desember

    // Finn første søndag i advent (4. søndag før jul)
    const dagFørJul = førsteJuldag.getDay();
    const fjerdeSøndagIAdvent = new Date(førsteJuldag);
    fjerdeSøndagIAdvent.setDate(førsteJuldag.getDate() - dagFørJul);

    const førsteSøndagIAdvent = new Date(fjerdeSøndagIAdvent);
    førsteSøndagIAdvent.setDate(fjerdeSøndagIAdvent.getDate() - 21); // 3 uker tilbake

    // Beregn hvilken adventsøndag vi har passert
    if (iDag < førsteSøndagIAdvent) return 0;

    for (let i = 1; i <= 4; i++) {
        const adventsøndag = new Date(førsteSøndagIAdvent);
        adventsøndag.setDate(førsteSøndagIAdvent.getDate() + (i - 1) * 7);
        const nesteSøndag = new Date(adventsøndag);
        nesteSøndag.setDate(adventsøndag.getDate() + 7);

        if (iDag >= adventsøndag && iDag < nesteSøndag) {
            return i;
        }
    }

    return 4; // Etter 4. søndag i advent
};

export const Jul: React.FC = () => {
    const antallLys = beregnAntallAdventslys();

    if (antallLys === 0) return null;

    return (
        <div className="ml-6 items-center gap-2 hidden md:flex">
            <Image src={stars} altText="julestjerner" className="h-12 w-12" />
            {Array.from({ length: antallLys }).map((_, index) => (
                <Image key={index} src={christmasCandle} altText={`adventslys ${index + 1}`} />
            ))}

            <Image src={stars} altText="julestjerner" className="h-12 w-12" />
        </div>
    );
};
