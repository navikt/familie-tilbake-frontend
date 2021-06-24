import '@testing-library/jest-dom';

import { Crypto } from '@peculiar/webcrypto';

global.crypto = new Crypto();
