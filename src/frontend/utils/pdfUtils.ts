import { base64ToArrayBuffer } from './miscUtils';

const createPdfBlobUrl = (base64Data: string): string => {
    const blob = new Blob([base64ToArrayBuffer(base64Data)], {
        type: 'application/pdf',
    });
    return globalThis.URL.createObjectURL(blob);
};

export const handlePdfData = (data: string): string => {
    if (data?.startsWith('blob:')) {
        return data;
    }
    return createPdfBlobUrl(data);
};

export const lagPdfBlobUrl = (blob: Blob | File): string =>
    URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
