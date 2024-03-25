import {NgModule } from '@angular/core';
import {BrowserModule } from '@angular/platform-browser';
import {AppComponent } from './app.component';
import {BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatRippleModule} from "@angular/material/core";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatRadioModule} from "@angular/material/radio";
import {HighchartsChartModule} from "highcharts-angular";
import {TargetCurvePointsComponent } from './target-curve-points/target-curve-points.component';
import {PointsConverterPipe } from './target-curve-points/points-converter.pipe';
import {MatExpansionModule} from "@angular/material/expansion";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {DecodeChannelNamePipe } from './helper-functions/decode-channel-name.pipe';
import {DecodeEqTypePipe } from './helper-functions/decode-eq-type.pipe';

@NgModule({
  declarations: [
    AppComponent,
    TargetCurvePointsComponent,
    PointsConverterPipe,
    DecodeChannelNamePipe,
    DecodeEqTypePipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatRippleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule,
    MatRadioModule,
    HighchartsChartModule,
    MatExpansionModule,
    ScrollingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
