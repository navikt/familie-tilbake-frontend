import { Select } from '@navikt/ds-react';
import React from 'react';

export interface Country {
    alpha2: string;
    label: string;
}

// List of countries in Norwegian (bokmål)
// Source: https://www.nav.no/land-verktoy/
export const countries: Country[] = [
    { alpha2: 'AF', label: 'Afghanistan' },
    { alpha2: 'AL', label: 'Albania' },
    { alpha2: 'DZ', label: 'Algerie' },
    { alpha2: 'AD', label: 'Andorra' },
    { alpha2: 'AO', label: 'Angola' },
    { alpha2: 'AG', label: 'Antigua og Barbuda' },
    { alpha2: 'AR', label: 'Argentina' },
    { alpha2: 'AM', label: 'Armenia' },
    { alpha2: 'AZ', label: 'Aserbajdsjan' },
    { alpha2: 'AU', label: 'Australia' },
    { alpha2: 'BS', label: 'Bahamas' },
    { alpha2: 'BH', label: 'Bahrain' },
    { alpha2: 'BD', label: 'Bangladesh' },
    { alpha2: 'BB', label: 'Barbados' },
    { alpha2: 'BE', label: 'Belgia' },
    { alpha2: 'BZ', label: 'Belize' },
    { alpha2: 'BJ', label: 'Benin' },
    { alpha2: 'BT', label: 'Bhutan' },
    { alpha2: 'BO', label: 'Bolivia' },
    { alpha2: 'BA', label: 'Bosnia-Hercegovina' },
    { alpha2: 'BW', label: 'Botswana' },
    { alpha2: 'BR', label: 'Brasil' },
    { alpha2: 'BN', label: 'Brunei' },
    { alpha2: 'BG', label: 'Bulgaria' },
    { alpha2: 'BF', label: 'Burkina Faso' },
    { alpha2: 'BI', label: 'Burundi' },
    { alpha2: 'CA', label: 'Canada' },
    { alpha2: 'CL', label: 'Chile' },
    { alpha2: 'CO', label: 'Colombia' },
    { alpha2: 'CK', label: 'Cookøyene' },
    { alpha2: 'CR', label: 'Costa Rica' },
    { alpha2: 'CU', label: 'Cuba' },
    { alpha2: 'DK', label: 'Danmark' },
    { alpha2: 'DJ', label: 'Djibouti' },
    { alpha2: 'DM', label: 'Dominica' },
    { alpha2: 'DO', label: 'Den dominikanske republikk' },
    { alpha2: 'EC', label: 'Ecuador' },
    { alpha2: 'EG', label: 'Egypt' },
    { alpha2: 'GQ', label: 'Ekvatorial-Guinea' },
    { alpha2: 'SV', label: 'El Salvador' },
    { alpha2: 'CI', label: 'Elfenbenskysten' },
    { alpha2: 'ER', label: 'Eritrea' },
    { alpha2: 'EE', label: 'Estland' },
    { alpha2: 'ET', label: 'Etiopia' },
    { alpha2: 'FJ', label: 'Fiji' },
    { alpha2: 'PH', label: 'Filippinene' },
    { alpha2: 'FI', label: 'Finland' },
    { alpha2: 'FR', label: 'Frankrike' },
    { alpha2: 'GA', label: 'Gabon' },
    { alpha2: 'GM', label: 'Gambia' },
    { alpha2: 'GE', label: 'Georgia' },
    { alpha2: 'GH', label: 'Ghana' },
    { alpha2: 'GR', label: 'Hellas' },
    { alpha2: 'GD', label: 'Grenada' },
    { alpha2: 'GT', label: 'Guatemala' },
    { alpha2: 'GN', label: 'Guinea' },
    { alpha2: 'GW', label: 'Guinea-Bissau' },
    { alpha2: 'GY', label: 'Guyana' },
    { alpha2: 'HT', label: 'Haiti' },
    { alpha2: 'HN', label: 'Honduras' },
    { alpha2: 'HK', label: 'Hongkong' },
    { alpha2: 'BY', label: 'Hviterussland' },
    { alpha2: 'IN', label: 'India' },
    { alpha2: 'ID', label: 'Indonesia' },
    { alpha2: 'IQ', label: 'Irak' },
    { alpha2: 'IR', label: 'Iran' },
    { alpha2: 'IE', label: 'Irland' },
    { alpha2: 'IS', label: 'Island' },
    { alpha2: 'IL', label: 'Israel' },
    { alpha2: 'IT', label: 'Italia' },
    { alpha2: 'JM', label: 'Jamaica' },
    { alpha2: 'JP', label: 'Japan' },
    { alpha2: 'YE', label: 'Jemen' },
    { alpha2: 'JO', label: 'Jordan' },
    { alpha2: 'KH', label: 'Kambodsja' },
    { alpha2: 'CM', label: 'Kamerun' },
    { alpha2: 'CV', label: 'Kapp Verde' },
    { alpha2: 'KZ', label: 'Kasakhstan' },
    { alpha2: 'KE', label: 'Kenya' },
    { alpha2: 'CN', label: 'Kina' },
    { alpha2: 'KG', label: 'Kirgisistan' },
    { alpha2: 'KI', label: 'Kiribati' },
    { alpha2: 'KM', label: 'Komorene' },
    { alpha2: 'CD', label: 'Kongo-Kinshasa' },
    { alpha2: 'CG', label: 'Kongo-Brazzaville' },
    { alpha2: 'XK', label: 'Kosovo' },
    { alpha2: 'HR', label: 'Kroatia' },
    { alpha2: 'KW', label: 'Kuwait' },
    { alpha2: 'CY', label: 'Kypros' },
    { alpha2: 'LA', label: 'Laos' },
    { alpha2: 'LV', label: 'Latvia' },
    { alpha2: 'LS', label: 'Lesotho' },
    { alpha2: 'LB', label: 'Libanon' },
    { alpha2: 'LR', label: 'Liberia' },
    { alpha2: 'LY', label: 'Libya' },
    { alpha2: 'LI', label: 'Liechtenstein' },
    { alpha2: 'LT', label: 'Litauen' },
    { alpha2: 'LU', label: 'Luxembourg' },
    { alpha2: 'MO', label: 'Macao' },
    { alpha2: 'MG', label: 'Madagaskar' },
    { alpha2: 'MK', label: 'Nord-Makedonia' },
    { alpha2: 'MW', label: 'Malawi' },
    { alpha2: 'MY', label: 'Malaysia' },
    { alpha2: 'MV', label: 'Maldivene' },
    { alpha2: 'ML', label: 'Mali' },
    { alpha2: 'MT', label: 'Malta' },
    { alpha2: 'MA', label: 'Marokko' },
    { alpha2: 'MH', label: 'Marshalløyene' },
    { alpha2: 'MR', label: 'Mauritania' },
    { alpha2: 'MU', label: 'Mauritius' },
    { alpha2: 'MX', label: 'Mexico' },
    { alpha2: 'FM', label: 'Mikronesiaføderasjonen' },
    { alpha2: 'MD', label: 'Moldova' },
    { alpha2: 'MC', label: 'Monaco' },
    { alpha2: 'MN', label: 'Mongolia' },
    { alpha2: 'ME', label: 'Montenegro' },
    { alpha2: 'MZ', label: 'Mosambik' },
    { alpha2: 'MM', label: 'Myanmar' },
    { alpha2: 'NA', label: 'Namibia' },
    { alpha2: 'NR', label: 'Nauru' },
    { alpha2: 'NL', label: 'Nederland' },
    { alpha2: 'NP', label: 'Nepal' },
    { alpha2: 'NZ', label: 'New Zealand' },
    { alpha2: 'NI', label: 'Nicaragua' },
    { alpha2: 'NE', label: 'Niger' },
    { alpha2: 'NG', label: 'Nigeria' },
    { alpha2: 'NU', label: 'Niue' },
    { alpha2: 'KP', label: 'Nord-Korea' },
    { alpha2: 'NO', label: 'Norge' },
    { alpha2: 'OM', label: 'Oman' },
    { alpha2: 'PK', label: 'Pakistan' },
    { alpha2: 'PW', label: 'Palau' },
    { alpha2: 'PS', label: 'Palestina' },
    { alpha2: 'PA', label: 'Panama' },
    { alpha2: 'PG', label: 'Papua Ny-Guinea' },
    { alpha2: 'PY', label: 'Paraguay' },
    { alpha2: 'PE', label: 'Peru' },
    { alpha2: 'PL', label: 'Polen' },
    { alpha2: 'PT', label: 'Portugal' },
    { alpha2: 'QA', label: 'Qatar' },
    { alpha2: 'RO', label: 'Romania' },
    { alpha2: 'RU', label: 'Russland' },
    { alpha2: 'RW', label: 'Rwanda' },
    { alpha2: 'SB', label: 'Salomonøyene' },
    { alpha2: 'WS', label: 'Samoa' },
    { alpha2: 'SM', label: 'San Marino' },
    { alpha2: 'ST', label: 'São Tomé og Príncipe' },
    { alpha2: 'SA', label: 'Saudi-Arabia' },
    { alpha2: 'SN', label: 'Senegal' },
    { alpha2: 'RS', label: 'Serbia' },
    { alpha2: 'SC', label: 'Seychellene' },
    { alpha2: 'SL', label: 'Sierra Leone' },
    { alpha2: 'SG', label: 'Singapore' },
    { alpha2: 'SK', label: 'Slovakia' },
    { alpha2: 'SI', label: 'Slovenia' },
    { alpha2: 'SO', label: 'Somalia' },
    { alpha2: 'ES', label: 'Spania' },
    { alpha2: 'LK', label: 'Sri Lanka' },
    { alpha2: 'GB', label: 'Storbritannia' },
    { alpha2: 'SD', label: 'Sudan' },
    { alpha2: 'SS', label: 'Sør-Sudan' },
    { alpha2: 'SR', label: 'Surinam' },
    { alpha2: 'CH', label: 'Sveits' },
    { alpha2: 'SE', label: 'Sverige' },
    { alpha2: 'SZ', label: 'Eswatini' },
    { alpha2: 'SY', label: 'Syria' },
    { alpha2: 'ZA', label: 'Sør-Afrika' },
    { alpha2: 'KR', label: 'Sør-Korea' },
    { alpha2: 'TJ', label: 'Tadsjikistan' },
    { alpha2: 'TW', label: 'Taiwan' },
    { alpha2: 'TZ', label: 'Tanzania' },
    { alpha2: 'TH', label: 'Thailand' },
    { alpha2: 'TG', label: 'Togo' },
    { alpha2: 'TO', label: 'Tonga' },
    { alpha2: 'TT', label: 'Trinidad og Tobago' },
    { alpha2: 'TD', label: 'Tsjad' },
    { alpha2: 'CZ', label: 'Tsjekkia' },
    { alpha2: 'TN', label: 'Tunisia' },
    { alpha2: 'TM', label: 'Turkmenistan' },
    { alpha2: 'TV', label: 'Tuvalu' },
    { alpha2: 'TR', label: 'Tyrkia' },
    { alpha2: 'DE', label: 'Tyskland' },
    { alpha2: 'UG', label: 'Uganda' },
    { alpha2: 'UA', label: 'Ukraina' },
    { alpha2: 'HU', label: 'Ungarn' },
    { alpha2: 'UY', label: 'Uruguay' },
    { alpha2: 'US', label: 'USA' },
    { alpha2: 'UZ', label: 'Usbekistan' },
    { alpha2: 'VU', label: 'Vanuatu' },
    { alpha2: 'VA', label: 'Vatikanstaten' },
    { alpha2: 'VE', label: 'Venezuela' },
    { alpha2: 'EH', label: 'Vest-Sahara' },
    { alpha2: 'VN', label: 'Vietnam' },
    { alpha2: 'ZM', label: 'Zambia' },
    { alpha2: 'ZW', label: 'Zimbabwe' },
    { alpha2: 'AT', label: 'Østerrike' },
    { alpha2: 'TL', label: 'Øst-Timor' },
];

interface IProps {
    id: string;
    label: string;
    excludeList?: string[];
    values?: string;
    error?: string;
    onOptionSelected: (country: { alpha2: string }) => void;
}

const CountrySelect: React.FC<IProps> = ({
    id,
    label,
    excludeList = [],
    values,
    error,
    onOptionSelected,
}) => {
    const filteredCountries = countries.filter(country => !excludeList.includes(country.alpha2));

    return (
        <Select
            id={id}
            label={label}
            error={error}
            value={values || ''}
            onChange={event => {
                const selectedCountry = countries.find(
                    country => country.alpha2 === event.target.value
                );
                if (selectedCountry) {
                    onOptionSelected(selectedCountry);
                }
            }}
        >
            <option value="">Velg land</option>
            {filteredCountries.map(country => (
                <option key={country.alpha2} value={country.alpha2}>
                    {country.label}
                </option>
            ))}
        </Select>
    );
};

export default CountrySelect;
