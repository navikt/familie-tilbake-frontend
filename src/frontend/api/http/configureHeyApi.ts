import { client as oldClient } from '@/generated/client.gen';
import { client as newClient } from '@/generated-new/client.gen';

import { leggTilApmInterceptor } from './apmHttpFeil';
import { preferredAxios } from './axios';

// De genererte klientene bruker egne axios-instanser, så interceptoren må legges på alle tre.
leggTilApmInterceptor(preferredAxios);
leggTilApmInterceptor(oldClient.instance);
leggTilApmInterceptor(newClient.instance);
