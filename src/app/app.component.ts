import { Component } from '@angular/core';
import {AudysseyRoot} from "./interfaces/audyssey-root";
import {DetectedChannel} from "./interfaces/detected-channel";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  audysseyData: AudysseyRoot = {
    detectedChannels: []
  };
  selectedChannel?: DetectedChannel;

  onUpload(target: FileList | null) {
    const file = target?.item(0);
    file?.text().then(fileContent => this.processData(fileContent));
  }

  private processData(content: string) {
    this.audysseyData = JSON.parse(content);
    console.log(this.audysseyData)
  }

  decodeChannelName(commandId: string) {
    switch (commandId) {
      case 'C' : return 'Center';
      case 'FL' : return 'Front Left';
      case 'FR' : return 'Front Right';
      case 'SLA' : return 'Surround Left';
      case 'SRA' : return 'Surround Right';
      case 'FHL' : return 'Front Height Left';
      case 'FHR' : return 'Front Height Right';
      case 'SW1' : return 'Subwoofer';
      case 'SW2' : return 'Subwoofer 2';

      //  FL
      // Center
      // FR
      // SLA
      // SRA
      // FHL
      // FHR
      // SW1
      default: return commandId;
    }
  }

  protected readonly JSON = JSON;
}
