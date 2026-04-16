import type { z } from 'zod';
import type { zVedtaksbrevRedigerbareDataUpdate } from '~/generated-new/zod.gen';

export type VedtaksbrevFormData = z.infer<typeof zVedtaksbrevRedigerbareDataUpdate>;
