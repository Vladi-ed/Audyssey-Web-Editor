import { Component, input, model } from '@angular/core';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { decodeChannelName } from '../helper-functions/decode-channel-name';
import { DetectedChannel } from '../interfaces/detected-channel';

@Component({
    selector: 'app-channel-selector',
    imports: [
        MatRadioGroup,
        MatRadioButton,
    ],
    templateUrl: './channel-selector.component.html',
    styleUrl: './channel-selector.component.scss'
})
export class ChannelSelectorComponent {
  detectedChannels = input.required<DetectedChannel[]>();
  selectedChannel = model<DetectedChannel>();
  channelName = input<(channel: DetectedChannel) => string>(channel => decodeChannelName(channel.commandId, channel.enChannelType));
}
