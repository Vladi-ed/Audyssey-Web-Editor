import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

function copyArray(arr: string[] | undefined) {
  if (arr?.length) return [...arr];
  else return [];
}

@Component({
  selector: 'app-target-curve-points',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './target-curve-points.component.html',
  styleUrl: './target-curve-points.component.scss'
})
export class TargetCurvePointsComponent {
  @Input({transform: copyArray, required: true})
  curvePoints!: string[]; // always come an array
  @Output()
  curvePointsChange = new EventEmitter<string[]>();
  showSaveBtn = false;

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
      this.curvePoints = [...this.curvePoints, '{, 0}']; // need to create a new array for change detection
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
      if (!this.curvePoints.at(0)?.startsWith('{20,')) this.curvePoints = ['{20, 0}', ...this.curvePoints];
      if (!this.curvePoints.at(-1)?.startsWith('{20000,')) this.curvePoints.push('{20000, 0}');
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
      const [aFreq] = a.substring(1, a.length - 1).split(',');
      const [bFreq] = b.substring(1, b.length - 1).split(',');
      return Number(aFreq) - Number(bFreq);
    });
  }
}
