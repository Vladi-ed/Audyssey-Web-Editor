import { ChangeDetectionStrategy, Component, Input, output, ViewChild } from "@angular/core";
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { FormsModule } from "@angular/forms";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { PointsConverterPipe } from "./points-converter.pipe";
import { MatInput } from "@angular/material/input";
import { MatRipple } from "@angular/material/core";

function copyArray(arr: string[] | undefined) {
  if (arr?.length) return [...arr];
  else return [];
}

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
  ],
  standalone: true
})
export class TargetCurvePointsComponent {
  @Input({transform: copyArray, required: true})
  curvePoints!: string[]; // always come as array
  curvePointsChange = output<string[]>();

  showSaveBtn = false;
  @ViewChild(CdkVirtualScrollViewport)
  scrollViewport: CdkVirtualScrollViewport | undefined;

  changeItem(point: { Hz: string; vol: number }, index: number) {
    const hz = Number(point.Hz);
    if (isNaN(hz)) return;
    if (hz > 20000) point.Hz = '20000';

    // point.Hz.padEnd(18, '0')
    this.curvePoints[index] = '{' + point.Hz + ', ' + point.vol + '}';
    this.showSaveBtn = true;
  }

  addPoint() {
    const lastPoint = this.curvePoints.at(-1);
    if (lastPoint) {
      this.curvePoints = [...this.curvePoints, '{20000, 0}']; // need to create a new array for change detection
      this.scrollViewport?.scrollTo({ bottom: -25, behavior: 'smooth' });

      this.showSaveBtn = true;
    }
    else {
      this.curvePoints = ['{, 0}'];
    }
  }

  removePoint(index: number) {
    this.curvePoints = this.curvePoints.filter((_, i) => i != index);
    this.showSaveBtn = true;
  }

  save() {
    // Need to ensure points are sorted for export at the least, but it's nice
    // to keep them sorted in the UI as well when users are done editing
    if (this.curvePoints.length) {
      this.sortPoints();
      const [firstFreq] = this.curvePoints[0].substring(1).split(',');
      if (Number(firstFreq) > 20) this.curvePoints = ['{20, 0}', ...this.curvePoints];

      const [lastFreq] = this.curvePoints.at(-1)!.substring(1).split(',');
      if (Number(lastFreq) < 20000) this.curvePoints.push('{20000, 0}');
    }
    this.curvePointsChange.emit(this.curvePoints);
    this.showSaveBtn = false;
  }

  copyPoints() {
    // navigator.clipboard.writeText(JSON.stringify(this.curvePoints));
    sessionStorage.setItem('target curve points', JSON.stringify(this.curvePoints))
  }

  pastePoints() {
    try {
      const newPointsStr = sessionStorage.getItem('target curve points');
      if (newPointsStr) {
        const newPoints = JSON.parse(newPointsStr);
        if (newPoints.length) this.curvePoints = newPoints;
        this.showSaveBtn = true;
      }
    }
    catch (e) {
      console.warn('Cannot paste', e)
    }
  }

  private sortPoints() {
    this.curvePoints.sort((a, b) => {
      const [aFreq] = a.substring(1).split(',');
      const [bFreq] = b.substring(1).split(',');
      return Number(aFreq) - Number(bFreq);
    });
  }

  changeItemString(point: string, index: number) {

    console.log('point', point, 'index', index);

    const regex = /\{([2-9]\d|[1-9]\d{2,3}|1\d{4}|20000)(\.\d+)?, -?(\d+(\.\d+)?)}/;

    if (regex.test(point)) {
      console.log('matches');
      this.curvePoints[index] = point;
      this.showSaveBtn = true;
    } else {
      // this.curvePoints[index] = "{20000, 0}";
      this.showSaveBtn = false;
    }
  }
}
