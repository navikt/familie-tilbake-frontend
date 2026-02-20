import type { zVedtaksbrevData } from '@generated-new/zod.gen';
import type z from 'zod';

export type VedtaksbrevFormData = z.infer<typeof zVedtaksbrevData>;
