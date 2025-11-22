import { ChangeDetectionStrategy, Component, effect, model, untracked, ViewChild } from "@angular/core";
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { FormsModule } from "@angular/forms";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { PointsConverterPipe } from "./points-converter.pipe";
import { MatInput } from "@angular/material/input";
import { MatRipple } from "@angular/material/core";

@Component({
  selector: 'app-target-curve-points',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./target-curve-points.component.html",
  styleUrl: "./target-curve-points.component.scss",
  imports: [
    FormsModule,
    MatFormField,
    PointsConverterPipe,
    MatInput,
    MatLabel,
    MatRipple,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll
  ]
})
export class TargetCurvePointsComponent {
  curvePoints = model.required<string[]>();

  localPoints: string[] = [];
  showSaveBtn = false;

  @ViewChild(CdkVirtualScrollViewport)
  scrollViewport: CdkVirtualScrollViewport | undefined;

  constructor() {
    effect(() => {
      const points = this.curvePoints();
      untracked(() => {
        this.localPoints = [...points];
        this.showSaveBtn = false;
      });
    });
  }

  changeItem(point: { Hz: string; vol: number }, index: number) {
    const hz = Number(point.Hz);
    if (isNaN(hz)) return;
    if (hz > 20000) point.Hz = '20000';

    // point.Hz.padEnd(18, '0')
    this.localPoints[index] = '{' + point.Hz + ', ' + point.vol + '}';
    this.showSaveBtn = true;
  }

  addPoint() {
    const lastPoint = this.localPoints.at(-1);
    if (lastPoint) {
      this.localPoints = [...this.localPoints, '{20000, 0}']; // need to create a new array for change detection
      this.scrollViewport?.scrollTo({ bottom: -25, behavior: 'smooth' });

      this.showSaveBtn = true;
    }
    else {
      this.localPoints = ['{, 0}'];
    }
  }

  removePoint(index: number) {
    this.localPoints = this.localPoints.filter((_, i) => i != index);
    this.showSaveBtn = true;
  }

  save() {
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
        if (newPoints.length) this.localPoints = newPoints;
        this.showSaveBtn = true;
      }
    }
    catch (e) {
      console.warn('Cannot paste', e)
    }
  }

  private sortPoints() {
    this.localPoints.sort((a, b) => {
      const getFreq = (str: string) => parseFloat(str.substring(1).split(',')[0]);
      return getFreq(a) - getFreq(b);
    });
  }

  changeItemString(point: string, index: number) {
    const regex = /\{([2-9]\d|[1-9]\d{2,3}|1\d{4}|20000)(\.\d+)?, -?(\d+(\.\d+)?)}/;

    if (regex.test(point)) {
      this.localPoints[index] = point;
      this.showSaveBtn = true;
    } else {
      this.showSaveBtn = false;
    }
  }
}
