import {NgModule } from '@angular/core';
import {BrowserModule } from '@angular/platform-browser';
import {AppComponent } from './app.component';
import {BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatOption, MatRipple } from "@angular/material/core";
import { MatCard, MatCardContent, MatCardHeader } from "@angular/material/card";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatSelect } from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import { MatCheckbox } from "@angular/material/checkbox";
import {HighchartsChartModule} from "highcharts-angular";
import {DecodeChannelNamePipe } from './helper-functions/decode-channel-name.pipe';
import {DecodeEqTypePipe } from './helper-functions/decode-eq-type.pipe';
import { ChannelSelectorComponent } from "./channel-selector/channel-selector.component";
import { TargetCurvePointsComponent } from "./target-curve-points/target-curve-points.component";
import { MatExpansionModule } from "@angular/material/expansion";

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        DecodeChannelNamePipe,
        ChannelSelectorComponent,
        TargetCurvePointsComponent,
        MatCard,
        MatCardContent,
        MatRipple,
        MatExpansionModule,
        MatFormField,
        FormsModule,
        MatSelect,
        MatLabel,
        MatOption,
        MatCheckbox,
        MatInput,
        MatCardHeader,
        HighchartsChartModule,
        DecodeEqTypePipe,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
