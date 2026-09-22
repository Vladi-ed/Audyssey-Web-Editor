import { Component, input, model } from '@angular/core';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { DecodeChannelNamePipe } from '../helper-functions/decode-channel-name.pipe';
import { DetectedChannel } from '../interfaces/detected-channel';

@Component({
    selector: 'app-channel-selector',
    imports: [
        MatRadioGroup,
        MatRadioButton,
        DecodeChannelNamePipe,
    ],
    templateUrl: './channel-selector.component.html',
    styleUrl: './channel-selector.component.scss'
})
export class ChannelSelectorComponent {
  detectedChannels = input.required<DetectedChannel[]>();
  selectedChannel = model<DetectedChannel>();
}
