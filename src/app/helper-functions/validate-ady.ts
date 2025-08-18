import { AudysseyInterface } from "../interfaces/audyssey-interface";

export function validateAdy(json: AudysseyInterface): string | null {
  if (!Array.isArray(json.detectedChannels)) return 'Invalid .ady file: missing detectedChannels array.';
  if (json.detectedChannels.length === 0) return 'Invalid .ady file: contains no channels.';
  const bad = json.detectedChannels.some((ch: any) => ch == null || ch.enChannelType == null || ch.commandId == null);
  if (bad) return 'Invalid .ady file: unexpected channel structure.';
  return null;
}
