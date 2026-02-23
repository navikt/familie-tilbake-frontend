import type z from 'zod';
import type { zVedtaksbrevData } from '~/generated-new/zod.gen';

export type VedtaksbrevFormData = z.infer<typeof zVedtaksbrevData>;
