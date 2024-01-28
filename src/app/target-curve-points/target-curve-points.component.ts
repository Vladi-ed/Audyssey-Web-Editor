import {Component, EventEmitter, Input, Output} from '@angular/core';

function copyArray(arr: string[] | undefined) {
  if (arr && arr.length) return [...arr];
  else return [ '{20, 0}', '{20000, 0}' ];
}

@Component({
  selector: 'app-target-curve-points',
  templateUrl: './target-curve-points.component.html',
  styleUrls: ['./target-curve-points.component.scss']
})
export class TargetCurvePointsComponent {
  @Input({transform: copyArray, required: true})
  curvePoints!: string[];

  @Output()
  curvePointsChange = new EventEmitter<string[]>();

  wasChanged = false;

  changeItem(point: { Hz: string; vol: string }, index: number) {
    if (isNaN(Number(point.Hz)) || isNaN(Number(point.vol))) return;
    if (Number(point.Hz) > 20000) point.Hz = '20000';
    if (Number(point.Hz) < 20) point.Hz = '20';
    if (Number(point.vol) < -12) point.vol = '-12';
    if (Number(point.vol) > 12) point.vol = '12';

    // point.Hz.padEnd(18, '0')
    this.curvePoints[index] = '{' + point.Hz + ', ' + point.vol + '}';
    this.wasChanged = true;
  }

  addPoint() {
    const lastPoint = this.curvePoints.at(-1);
    if (lastPoint) {
      this.curvePoints = [...this.curvePoints, lastPoint]; // need to create a new array for change detection
      this.wasChanged = true;
    }
  }
  removePoint(index: number) {
    setTimeout(
      () => this.curvePoints = this.curvePoints.filter((_, i) => i != index),
      150
    );
    this.wasChanged = true;
  }

  save() {
    this.curvePointsChange.emit(this.curvePoints);
    this.wasChanged = false;
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
        this.wasChanged = true;
      }
    }
    catch (e) {
      console.warn('Cannot paste', e)
    }
  }
}
