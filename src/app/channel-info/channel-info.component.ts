import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, effect, input, linkedSignal, output, untracked } from '@angular/core';
import { disabled, form, FormField, max, min, required, validate } from '@angular/forms/signals';
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
    imports: [DecimalPipe, FormField, MatCheckbox, MatOption, MatError, MatFormField, MatLabel, MatInput, MatRadioButton, MatRadioGroup, MatSelect, MatTooltip, NgOptimizedImage],
    selector: 'app-channel-info',
    styleUrl: './channel-info.component.scss',
    templateUrl: './channel-info.component.html',
})
export class ChannelInfoComponent {
    // Correction settings can belong to a different channel than the physical output.
    selectedChannel = input.required<DetectedChannel>();
    correctionCurveChannel = input<DetectedChannel>();
    sharedSubwooferOutputs = input<DetectedChannel[]>([]);
    receiverModelName = input<string>();

    chartSettingsChanged = output<void>();
    midrangeCompensationChanged = output<void>();
    subwooferOutputSelected = output<DetectedChannel>();

    private formValue = linkedSignal<ChannelSettingsValue>(() =>
        readChannelSettings(this.selectedChannel(), this.correctionCurveChannel()));

    settingsForm = form(this.formValue, path => {
        disabled(path.frequencyRangeRolloff, { when: () => !this.correctionCurveChannel() });
        disabled(path.trimAdjustment);
        required(path.frequencyRangeRolloff, { message: 'Use a value from 20 to 20,000' });
        min(path.frequencyRangeRolloff, channelSettingsLimits.frequency.min, { message: 'Use a value from 20 to 20,000' });
        max(path.frequencyRangeRolloff, channelSettingsLimits.frequency.max, { message: 'Use a value from 20 to 20,000' });
        min(path.customDistance, channelSettingsLimits.distance.min, { message: 'Use a distance from 0 to 18 m, or leave empty for Auto.' });
        max(path.customDistance, channelSettingsLimits.distance.max, { message: 'Use a distance from 0 to 18 m, or leave empty for Auto.' });
        min(path.customLevel, channelSettingsLimits.level.min, { message: 'Use a level from −12 to +12 dB, or leave empty for Auto.' });
        max(path.customLevel, channelSettingsLimits.level.max, { message: 'Use a level from −12 to +12 dB, or leave empty for Auto.' });
        for (const numericPath of [path.frequencyRangeRolloff, path.customDistance, path.customLevel]) {
            validate(numericPath, ({ value }) => value() === null || Number.isFinite(value()) ? null
                : { kind: 'finite', message: 'Enter a finite number.' });
        }
        validate(path.customLevel, ({ value }) => {
            const level = value();
            return level === null || Number.isInteger(level * 2) ? null
                : { kind: 'step', message: 'Use 0.5 dB increments.' };
        });
    });

    // Imported values remain untouched; only invalid user edits block export.
    hasInvalidEdits = computed(() => [
        this.settingsForm.frequencyRangeRolloff(), this.settingsForm.customDistance(),
        this.settingsForm.customLevel(),
    ].some(field => !field.disabled() && field.invalid()
        && (field.dirty() || field.errors().some(error => error.kind === 'parse'))));

    fieldErrorStateMatcher(key: 'frequencyRangeRolloff' | 'customDistance' | 'customLevel') {
        return { isErrorState: () => {
            const field = this.settingsForm[key]();
            return !field.disabled() && field.invalid()
                && (field.dirty() || field.errors().some(error => error.kind === 'parse'));
        } };
    }

    isSubwoofer = isSubwoofer;
    crossoverOptions = computed(() =>
        getReceiverCrossoverOptions(this.receiverModelName()));
    unavailableCrossover = computed(() => {
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
            const previous = readChannelSettings(this.selectedChannel(), this.correctionCurveChannel());
            const validValue = { ...value };
            for (const key of ['frequencyRangeRolloff', 'customDistance', 'customLevel', 'trimAdjustment'] as const) {
                const field = this.settingsForm[key]();
                // Native parsing errors can yield null too; those must not clear an override.
                if (field.invalid() || field.disabled()) validValue[key] = previous[key];
            }
            untracked(() => {
                // Bridge the signal form to the existing mutable ADY data used by charts/export.
                const { chartChanged, midrangeChanged } = writeChannelSettings(
                    validValue, this.selectedChannel(), this.correctionCurveChannel());
                if (chartChanged) this.chartSettingsChanged.emit();
                else if (midrangeChanged) this.midrangeCompensationChanged.emit();
            });
        });
    }

    updateCrossover(value: CustomCrossover | '') {
        if (value && !this.crossoverOptions().some(option => option.value === value)) return;
        this.formValue.update(current => ({
            ...current,
            customCrossover: value,
            customSpeakerType: value ? (value === 'F' ? 'L' : 'S') : '',
        }));
    }

    updateSpeakerType(value: CustomSpeakerType) {
        this.formValue.update(current => {
            let customCrossover: any = '';
            if (value === 'L') customCrossover = 'F';
            else if (value) {
                customCrossover = current.customCrossover && current.customCrossover !== 'F'
                    ? current.customCrossover : '80';
            }

            return {
                ...current,
                customSpeakerType: value,
                customCrossover,
            };
        });
    }
}
