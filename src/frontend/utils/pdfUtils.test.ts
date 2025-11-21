import { base64ToArrayBuffer } from './miscUtils';
import { handlePdfData } from './pdfUtils';

jest.mock('./miscUtils', () => ({
    base64ToArrayBuffer: jest.fn(),
}));

const mockCreateObjectURL = jest.fn();
Object.defineProperty(globalThis, 'URL', {
    value: {
        createObjectURL: mockCreateObjectURL,
    },
    writable: true,
});

const mockBlob = jest.fn();
Object.defineProperty(globalThis, 'Blob', {
    value: mockBlob,
    writable: true,
});

describe('pdfUtils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('handlePdfData', () => {
        it('skal returnere data som det er hvis det starter med "blob:"', () => {
            const blobUrl = 'blob:http://localhost:3000/12345678-1234-1234-1234-123456789012';

            const result = handlePdfData(blobUrl);

            expect(result).toBe(blobUrl);
            expect(base64ToArrayBuffer).not.toHaveBeenCalled();
            expect(mockCreateObjectURL).not.toHaveBeenCalled();
        });

        it('skal lage blob URL fra base64 data når data ikke starter med blob:', () => {
            const base64Data =
                'JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoK';
            const mockArrayBuffer = new ArrayBuffer(8);
            const mockBlobInstance = { type: 'application/pdf' };
            const expectedBlobUrl =
                'blob:http://localhost:3000/12345678-1234-1234-1234-123456789012';

            (base64ToArrayBuffer as jest.Mock).mockReturnValue(mockArrayBuffer);
            mockBlob.mockReturnValue(mockBlobInstance);
            mockCreateObjectURL.mockReturnValue(expectedBlobUrl);

            const result = handlePdfData(base64Data);

            expect(base64ToArrayBuffer).toHaveBeenCalledWith(base64Data);
            expect(mockBlob).toHaveBeenCalledWith([mockArrayBuffer], {
                type: 'application/pdf',
            });
            expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlobInstance);
            expect(result).toBe(expectedBlobUrl);
        });
    });
});
