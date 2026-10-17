import type { CustomCrossover } from '../interfaces/detected-channel';

// Recovered Original App Utility model groups; see docs/ady-channel-settings.md.
// Use known supported models rather than treating every unknown model as newer.
const modelsWith70Hz = new Set([
    // FY23 / FY23 flagships
    'AVR-S970H', 'AVR-X2800H', 'AVR-X3800H', 'AVC-X3800H', 'AVR-X4800H', 'AVC-X4800H',
    'CINEMA 70S', 'CINEMA 60', 'CINEMA 50', 'CINEMA 40', 'AV 10', 'AVR-A1H', 'AVC-A1H',
    // CY2023–2026
    'AVR-S770H', 'AVR-X1800H', 'AVC-X6800H', 'AVR-X6800H', 'CINEMA 30',
    'AVR-A10H', 'AVC-A10H', 'AV 20', 'AV 30', 'AVC-X2850H',
    'AVR-S980H', 'AVR-X2900H', 'AVR-X3900H', 'AVC-X3900H',
    'CINEMA 70S SERIES 2', 'CINEMA 60 SERIES 2', 'CINEMA 50 SERIES 2',
]);

const modelsWith180Hz = new Set([
    // Original App substitutes 200 Hz at upload on these models if live Dolby is < 1.6.
    'AVR-X8500H', 'AVC-X8500H', 'AV8805',
    // FY20
    'AVR-S750H', 'AVR-S950H', 'AVR-X1600H', 'AVR-X2600H', 'AVR-X3600H',
    'NR1710', 'SR5014', 'SR6014',
    // FY21 / FY21 flagships
    'AVR-S960H', 'AVR-X2700H', 'AVR-X3700H', 'AVC-X3700H', 'AVR-X4700H', 'AVC-X4700H',
    'AVR-X6700H', 'AVC-X6700H', 'NR1711', 'SR5015', 'SR6015', 'SR7015', 'SR8015', 'AV7706',
    'AVR-A110', 'AVC-A110', 'AVR-X8500HA', 'AVC-X8500HA', 'AV8805A',
    // FY22
    'AVR-S760H', 'AVR-X1700H',
]);

const allCrossoverOptions = [
    { value: '40', label: '40 Hz' },
    { value: '60', label: '60 Hz' },
    { value: '70', label: '70 Hz' },
    { value: '80', label: '80 Hz' },
    { value: '90', label: '90 Hz' },
    { value: '10', label: '100 Hz' },
    { value: '11', label: '110 Hz' },
    { value: '12', label: '120 Hz' },
    { value: '15', label: '150 Hz' },
    { value: '18', label: '180 Hz' },
    { value: '20', label: '200 Hz' },
    { value: '25', label: '250 Hz' },
    { value: 'F', label: 'Full Band' },
] as const satisfies { value: CustomCrossover; label: string }[];

export function getReceiverCrossoverOptions(targetModelName?: string) {
    const model = (targetModelName ?? '').trim().replace(/^\*/, '').replace(/^(Denon|Marantz)\s+/i, '')
        .replace(/\s+/g, ' ').toUpperCase();
    const supports70Hz = modelsWith70Hz.has(model);
    const supports180Hz = supports70Hz || modelsWith180Hz.has(model);

    return allCrossoverOptions.filter(option =>
        (option.value !== '70' || supports70Hz) && (option.value !== '18' || supports180Hz));
}
