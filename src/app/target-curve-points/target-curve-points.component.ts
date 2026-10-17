import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    model,
    signal,
    untracked,
    ViewChild
} from '@angular/core';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { PointsConverterPipe } from './points-converter.pipe';
import { MatInput } from '@angular/material/input';
import { MatRipple } from '@angular/material/core';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-target-curve-points',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './target-curve-points.component.html',
    styleUrl: './target-curve-points.component.scss',
    imports: [
        FormsModule,
        MatFormField,
        PointsConverterPipe,
        MatInput,
        MatLabel,
        MatRipple,
        CdkVirtualScrollViewport,
        CdkVirtualForOf,
        CdkFixedSizeVirtualScroll,
        MatTooltip
    ]
})
export class TargetCurvePointsComponent {
    curvePoints = model.required<string[]>();

    localPoints: string[] = [];
    showSaveBtn = false;
    rowErrors = signal<({ frequency?: string; gain?: string; raw?: string } | undefined)[]>([]);
    hasInvalidEdits = computed(() => this.rowErrors().some(error => !!error));
    hasRawPointErrors = computed(() => this.rowErrors().some(error => !!error?.raw));
    frequencyPattern = String.raw`^(?:([2-9]\d|[1-9]\d{2,3}|1\d{4})(\.\d+)?|20000(\.0+)?)$`;
    @ViewChild(CdkVirtualScrollViewport)
    scrollViewport: CdkVirtualScrollViewport | undefined;

    constructor() {
        effect(() => {
            const points = this.curvePoints();
            untracked(() => {
                this.localPoints = [...points];
                this.showSaveBtn = false;
                this.rowErrors.set([]);
            });
        });
    }

    fieldErrorStateMatcher(index: number, field: 'frequency' | 'gain') {
        return { isErrorState: () => !!this.rowErrors()[index]?.[field] };
    }

    changeItem(point: { Hz: string; vol: number | null }, index: number) {
        // Keep invalid drafts too, so export cannot silently use an earlier value.
        this.localPoints[index] = '{' + point.Hz + ', ' + (point.vol ?? '') + '}';
        this.setRowError(index, this.validatePoint(this.localPoints[index]));
        this.showSaveBtn = true;
    }

    addPoint() {
        const lastPoint = this.localPoints.at(-1);
        if (lastPoint) {
            this.localPoints = [...this.localPoints, '{20000, 0}']; // need to create a new array for change detection
            this.scrollViewport?.scrollTo({ bottom: -25, behavior: 'smooth' });

            this.showSaveBtn = true;
        } else {
            this.localPoints = ['{, 0}'];
        }
        this.setRowError(this.localPoints.length - 1, this.validatePoint(this.localPoints.at(-1)!));
        this.showSaveBtn = true;
    }

    removePoint(index: number) {
        this.localPoints = this.localPoints.filter((_, i) => i != index);
        this.rowErrors.update(errors => {
            const updated = [...errors];
            updated.splice(index, 1);
            return updated;
        });
        this.showSaveBtn = true;
    }

    save() {
        if (this.hasInvalidEdits()) return;
        // Need to ensure points are sorted for export at the least, but it's nice
        // to keep them sorted in the UI as well when users are done editing
        if (this.localPoints.length) {
            this.sortPoints();
            const [firstFreq] = this.localPoints[0].substring(1).split(',');
            if (Number(firstFreq) > 20) this.localPoints = ['{20, 0}', ...this.localPoints];

            const [lastFreq] = this.localPoints.at(-1)!.substring(1).split(',');
            if (Number(lastFreq) < 20000) this.localPoints.push('{20000, 0}');
        }
        this.curvePoints.set(this.localPoints);
        this.showSaveBtn = false;
    }

    copyPoints() {
        // navigator.clipboard.writeText(JSON.stringify(this.curvePoints));
        sessionStorage.setItem('target curve points', JSON.stringify(this.localPoints))
    }

    pastePoints() {
        try {
            const newPointsStr = sessionStorage.getItem('target curve points');
            if (newPointsStr) {
                const newPoints = JSON.parse(newPointsStr);
                if (Array.isArray(newPoints) && newPoints.every(point => typeof point === 'string')) {
                    this.localPoints = newPoints;
                    this.rowErrors.set(newPoints.map(point => this.validatePoint(point)));
                    this.showSaveBtn = true;
                }
            }
        } catch (e) {
            console.warn('Cannot paste', e)
        }
    }

    changeItemString(point: string, index: number) {
        this.localPoints[index] = point;
        this.setRowError(index, this.validatePoint(point));
        this.showSaveBtn = true;
    }

    private sortPoints() {
        this.localPoints.sort((a, b) => {
            const getFreq = (str: string) => Number.parseFloat(str.substring(1).split(',')[0]);
            return getFreq(a) - getFreq(b);
        });
    }

    private setRowError(index: number, error: ReturnType<TargetCurvePointsComponent['validatePoint']>) {
        this.rowErrors.update(errors => {
            const updated = [...errors];
            updated[index] = error;
            return updated;
        });
    }

    private validatePoint(point: string) {
        const match = /^\{([^,]*),([^}]*)}$/.exec(point);
        if (!match) return { raw: 'Use {frequency, gain}, for example {1000, -2.5}.' };

        const frequency = match[1].trim();
        const gain = match[2].trim();
        const errors: { frequency?: string; gain?: string; raw?: string } = {};
        if (!new RegExp(this.frequencyPattern).test(frequency)) {
            errors.frequency = 'Enter a frequency from 20 to 20,000 Hz.';
        }
        const decimalGain = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
        if (!decimalGain.test(gain) || !Number.isFinite(Number(gain)) || Number(gain) < -12 || Number(gain) > 12) {
            errors.gain = 'Enter a gain from −12 to 12 dB.';
        }
        return Object.keys(errors).length ? errors : undefined;
    }
}
