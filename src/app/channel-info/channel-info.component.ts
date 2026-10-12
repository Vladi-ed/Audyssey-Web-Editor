import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, input, linkedSignal, output, untracked } from '@angular/core';
import { form, FormField, max, min, required, validate } from '@angular/forms/signals';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatOption } from '@angular/material/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { isSubwoofer } from '../helper-functions/correction-channel';
import type { ChannelSettingsValue } from '../helper-functions/channel-settings';
import { channelSettingsLimits, readChannelSettings, writeChannelSettings } from '../helper-functions/channel-settings';
import type { CustomCrossover, CustomSpeakerType, DetectedChannel } from '../interfaces/detected-channel';
import { getReceiverCrossoverOptions } from '../helper-functions/receiver-crossovers';
import { decodeCrossover } from '../helper-functions/decode-crossover';

@Component({
    imports: [DecimalPipe, FormField, MatCheckbox, MatOption, MatError, MatFormField, MatLabel, MatInput, MatRadioButton, MatRadioGroup, MatSelect, MatTooltip],
    selector: 'app-channel-info',
    styleUrl: './channel-info.component.scss',
    templateUrl: './channel-info.component.html',
})
export class ChannelInfoComponent {
    // Correction settings can belong to a different channel than the physical output.
    selectedChannel = input.required<DetectedChannel>();
    correctionCurveChannel = input<DetectedChannel>();
    sharedSubwooferOutputs = input<readonly DetectedChannel[]>([]);
    receiverModelName = input<string>();

    chartSettingsChanged = output<void>();
    midrangeCompensationChanged = output<void>();
    subwooferOutputSelected = output<DetectedChannel>();

    private readonly formValue = linkedSignal<ChannelSettingsValue>(() =>
        readChannelSettings(this.selectedChannel(), this.correctionCurveChannel()));

    protected readonly settingsForm = form(this.formValue, path => {
        required(path.frequencyRangeRolloff);
        min(path.frequencyRangeRolloff, channelSettingsLimits.frequency.min);
        max(path.frequencyRangeRolloff, channelSettingsLimits.frequency.max);
        min(path.customDistance, channelSettingsLimits.distance.min);
        max(path.customDistance, channelSettingsLimits.distance.max);
        min(path.customLevel, channelSettingsLimits.level.min);
        max(path.customLevel, channelSettingsLimits.level.max);
        validate(path.customLevel, ({ value }) => {
            const level = value();
            return level === null || Number.isInteger(level * 2) ? null
                : { kind: 'step', message: 'Use 0.5 dB increments.' };
        });
        const { min: minTrim, max: maxTrim } = channelSettingsLimits.trim;
        const trimRangeMessage = `Use a value from ${minTrim} to +${maxTrim} dB.`;
        min(path.trimAdjustment, minTrim, { message: trimRangeMessage });
        max(path.trimAdjustment, maxTrim, { message: trimRangeMessage });
        validate(path.trimAdjustment, ({ value }) => {
            const trim = value();
            return trim === null || Number.isFinite(trim) ? null
                : { kind: 'finite', message: 'Enter a finite number.' };
        });
    });

    protected readonly isSubwoofer = isSubwoofer;
    protected readonly crossoverOptions = computed(() =>
        getReceiverCrossoverOptions(this.receiverModelName()));
    protected readonly unavailableCrossover = computed(() => {
        const value = this.formValue().customCrossover;
        if (!value || this.crossoverOptions().some(option => option.value === value)) return undefined;
        return { value, label: value === 'U' ? 'Unsupported' : `${decodeCrossover(value)} Hz (not supported)` };
    });

    constructor() {
        effect(() => {
            this.selectedChannel();
            this.correctionCurveChannel();
            // The linked model reloads values; reset only the form's touched/dirty state.
            untracked(() => this.settingsForm().reset());
        });

        effect(() => {
            const value = this.formValue();
            untracked(() => {
                // Bridge the signal form to the existing mutable ADY data used by charts/export.
                const { chartChanged, midrangeChanged } = writeChannelSettings(
                    value, this.selectedChannel(), this.correctionCurveChannel());
                if (chartChanged) this.chartSettingsChanged.emit();
                else if (midrangeChanged) this.midrangeCompensationChanged.emit();
            });
        });
    }

    protected resetEmptyTrimAdjustment(): void {
        const trim = this.settingsForm.trimAdjustment().value;
        if (trim() === null) trim.set(0);
    }

    updateCrossover(value: CustomCrossover | ''): void {
        if (value && !this.crossoverOptions().some(option => option.value === value)) return;
        this.formValue.update(current => ({
            ...current,
            customCrossover: value,
            customSpeakerType: value ? (value === 'F' ? 'L' : 'S') : '',
        }));
    }

    updateSpeakerType(value: CustomSpeakerType | ''): void {
        this.formValue.update(current => ({
            ...current,
            customSpeakerType: value,
            customCrossover: value === 'L' ? 'F' : value
                ? (current.customCrossover && current.customCrossover !== 'F' ? current.customCrossover : '40') : '',
        }));
    }
}
