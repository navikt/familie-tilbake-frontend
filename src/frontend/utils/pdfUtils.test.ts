import { base64ToArrayBuffer } from './miscUtils';
import { handlePdfData } from './pdfUtils';

vi.mock('./miscUtils', () => ({
    base64ToArrayBuffer: vi.fn(),
}));

const mockCreateObjectURL = vi.fn();
Object.defineProperty(globalThis, 'URL', {
    value: {
        createObjectURL: mockCreateObjectURL,
    },
    writable: true,
});

// Mock Blob som en constructor class
class MockBlob {
    type: string;
    constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        this.type = options?.type || '';
    }
}

Object.defineProperty(globalThis, 'Blob', {
    value: MockBlob,
    writable: true,
});

describe('pdfUtils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
            const expectedBlobUrl =
                'blob:http://localhost:3000/12345678-1234-1234-1234-123456789012';

            (base64ToArrayBuffer as ReturnType<typeof vi.fn>).mockReturnValue(mockArrayBuffer);
            mockCreateObjectURL.mockReturnValue(expectedBlobUrl);

            const result = handlePdfData(base64Data);

            expect(base64ToArrayBuffer).toHaveBeenCalledWith(base64Data);
            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(result).toBe(expectedBlobUrl);
        });
    });
});
