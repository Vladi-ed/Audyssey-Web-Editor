import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';

@Component({
  selector: 'app-target-curve-points',
  templateUrl: './target-curve-points.component.html',
  styleUrls: ['./target-curve-points.component.scss']
})
export class TargetCurvePointsComponent implements OnChanges {
  @Input() inputArr = [ '{20, 0}', '{20000, 0}' ];
  @Output() updatePointsEvent = new EventEmitter<string[]>();
  wasChanged = false;

  ngOnChanges() {
    // @Input() inputArr was changed
    // TODO: make a copy of input array to not mutate it.
    this.wasChanged = false;
  }

  changeItem(point: { Hz: string; vol: string }, index: number) {
    if (!point.vol) point.vol = '0';
    if (isNaN(Number(point.Hz)) || isNaN(Number(point.vol))) return;

    this.inputArr[index] = '{' + point.Hz + ', ' + point.vol + '}';
    // this.wasChanged = true;
  }

  addPoint() {
    this.inputArr = [...this.inputArr, '{10, 0}'];
    this.wasChanged = true;
  }
  removePoint(index: number) {
    setTimeout(()=> this.inputArr = this.inputArr.filter((_, i) => i != index), 100);
    this.wasChanged = true;
  }

  save() {
    this.updatePointsEvent.emit(this.inputArr);
    this.wasChanged = false;
  }
}
