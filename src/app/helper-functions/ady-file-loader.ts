import type { AudysseyInterface } from '../interfaces/audyssey-interface';
import { validateAdy } from './validate-ady';

interface AdyLoadHandlers {
    accepted: (data: AudysseyInterface, filename?: string) => void;
    processed: (measurements: Map<number, number[][]>) => void;
    loadingChanged: () => void;
    error: (message: string, cause?: unknown) => void;
}

// Owns the file/worker lifecycle; the caller decides how to present each result.
export class AdyFileLoader {
    private readingFile = false;
    private requestId = 0;
    private activeWorker?: Worker;

    constructor(private readonly handlers: AdyLoadHandlers) {}

    get isLoading(): boolean {
        return this.readingFile || this.activeWorker !== undefined;
    }

    async loadFile(file: File): Promise<AudysseyInterface | undefined> {
        const requestId = this.beginReading();
        try {
            const content = await file.text();
            if (requestId !== this.requestId) return undefined;
            const data = JSON.parse(content);
            return this.process(data, file.name) ? data : undefined;
        } catch (cause) {
            if (requestId === this.requestId) {
                this.handlers.error('Invalid file format. Expecting .ady file JSON format.', cause);
            }
            return undefined;
        } finally {
            this.finishReading(requestId);
        }
    }

    async loadExample(): Promise<void> {
        const requestId = this.beginReading();
        try {
            const response = await fetch('assets/example-2-subs.ady');
            if (!response.ok) throw new Error(`Example request failed: ${response.status}`);
            const data = await response.json();
            if (requestId === this.requestId) this.process(data);
        } catch (cause) {
            if (requestId === this.requestId) this.handlers.error('Cannot load the example file.', cause);
        } finally {
            this.finishReading(requestId);
        }
    }

    process(json: unknown, filename?: string): boolean {
        const validationError = validateAdy(json);
        if (validationError) {
            this.handlers.error(validationError);
            return false;
        }
        const data = json as AudysseyInterface;
        this.activeWorker?.terminate();
        this.activeWorker = undefined;
        this.handlers.accepted(data, filename);

        if (typeof Worker === 'undefined') {
            this.handlers.error('Your browser is not supported. Please use latest Firefox or Chrome.');
            this.handlers.loadingChanged();
            return false;
        }

        try {
            const worker = new Worker(new URL('./bg-calculator.worker', import.meta.url));
            this.activeWorker = worker;
            worker.onmessage = ({ data }: MessageEvent<Map<number, number[][]>>) => {
                worker.terminate();
                if (this.activeWorker !== worker) return;
                this.activeWorker = undefined;
                this.handlers.processed(data);
                this.handlers.loadingChanged();
            };
            worker.onerror = cause => {
                worker.terminate();
                if (this.activeWorker !== worker) return;
                this.activeWorker = undefined;
                this.handlers.loadingChanged();
                this.handlers.error('Background processing error.', cause);
            };
            worker.postMessage({ channels: data.detectedChannels, subwooferMode: data.subwooferMode });
            this.handlers.loadingChanged();
            return true;
        } catch (cause) {
            this.activeWorker?.terminate();
            this.activeWorker = undefined;
            this.handlers.loadingChanged();
            this.handlers.error('Background processing error.', cause);
            return false;
        }
    }

    destroy() {
        // Invalidate pending reads and callbacks before the component goes away.
        this.requestId++;
        this.readingFile = false;
        this.activeWorker?.terminate();
        this.activeWorker = undefined;
    }

    private beginReading(): number {
        this.readingFile = true;
        this.handlers.loadingChanged();
        return ++this.requestId;
    }

    private finishReading(requestId: number) {
        if (requestId !== this.requestId) return;
        this.readingFile = false;
        this.handlers.loadingChanged();
    }
}
