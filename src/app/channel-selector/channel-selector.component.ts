import { Component, input, model } from "@angular/core";
import { MatRadioButton, MatRadioChange, MatRadioGroup } from "@angular/material/radio";
import { FormsModule } from "@angular/forms";
import { DecodeChannelNamePipe } from "../helper-functions/decode-channel-name.pipe";
import { DetectedChannel } from "../interfaces/detected-channel";

@Component({
  selector: 'app-channel-selector',
  standalone: true,
  imports: [
    MatRadioGroup,
    FormsModule,
    MatRadioButton,
    DecodeChannelNamePipe,
  ],
  templateUrl: './channel-selector.component.html',
  styleUrl: './channel-selector.component.scss'
})
export class ChannelSelectorComponent {
  detectedChannels = input.required<DetectedChannel[]>();
  selectedChannel = model<DetectedChannel>();

  updateSelectedChannel(selectorChange: MatRadioChange) {
    this.selectedChannel.set(selectorChange.value);
  }
}
