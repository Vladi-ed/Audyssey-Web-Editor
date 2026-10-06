export function validateAdy(json: unknown): string | null {
  if (!json || typeof json !== 'object' || !('detectedChannels' in json) || !Array.isArray(json.detectedChannels)) return 'Invalid .ady file: missing detectedChannels array.';
  if (json.detectedChannels.length === 0) return 'Invalid .ady file: contains no channels.';
  const bad = json.detectedChannels.some(ch => ch == null || typeof ch !== 'object' || typeof ch.enChannelType !== 'number' || typeof ch.commandId !== 'string');
  if (bad) return 'Invalid .ady file: unexpected channel structure.';
  return null;
}
