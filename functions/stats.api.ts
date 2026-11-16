import { classifyReceiver } from '../src/app/helper-functions/classify-receiver';
import { getClientDevice } from '../src/app/helper-functions/get-client-device';
import { decodeChannelName } from '../src/app/helper-functions/decode-channel-name';

interface Env {
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_CHAT_ID?: string;
    STATS?: AnalyticsEngineDataset;
}

interface ImportStats {
    model: string;
    channels?: string[];
    screenSize?: string;
}

interface ClientInfo {
    ip: string;
    country: string;
    city: string;
    device: string;
    browser: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }): Promise<Response> => {
    let data: unknown;
    try {
        const body = await request.arrayBuffer();
        if (body.byteLength > 8192) return new Response('Request body is too large.', { status: 413 });
        data = JSON.parse(new TextDecoder().decode(body));
    } catch {
        return new Response('Invalid JSON body.', { status: 400 });
    }
    if (!isImportStats(data)) {
        return new Response('Invalid statistics payload.', { status: 400 });
    }

    try {
        const { brand, model, tier } = classifyReceiver(data.model);
        env.STATS?.writeDataPoint({
            blobs: [brand, model, tier, JSON.stringify(data.channels ?? [])]
        });

        if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
            const country = request.cf?.country;
            const clientInfo: ClientInfo = {
                ip: (request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown').slice(0, 128),
                country: country ? new Intl.DisplayNames(['en'], { type: 'region' }).of(country) ?? country : 'unknown',
                city: (request.cf?.city || 'unknown').slice(0, 128),
                ...getClientDevice(request.headers.get('user-agent'), request.headers.get('sec-ch-ua'))
            };
            const receiverName = brand === 'unknown' ? model : `${brand} ${model}`;
            await sendToTelegram({ ...data, model: receiverName }, clientInfo, env);
        }

        return Response.json({ success: true, message: 'Record received' });
    } catch {
        console.error('Could not record import statistics.');
        return new Response('Could not record statistics.', { status: 500 });
    }
};

function isImportStats(value: unknown): value is ImportStats {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const data = value as Record<string, unknown>;
    if (typeof data.model !== 'string' || !data.model.trim() || data.model.length > 160) return false;
    if (data.channels !== undefined && (!Array.isArray(data.channels) || data.channels.length > 64
        || !data.channels.every(channel => typeof channel === 'string' && channel.length <= 32))) return false;
    if (data.screenSize !== undefined && (typeof data.screenSize !== 'string' || data.screenSize.length > 32)) return false;
    return true;
}

async function sendToTelegram(data: ImportStats, clientInfo: ClientInfo, env: Env): Promise<void> {
    try {
        const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000),
            body: JSON.stringify({
                chat_id: env.TELEGRAM_CHAT_ID,
                text: formatTelegramMessage(data, clientInfo),
                parse_mode: 'HTML',
                link_preview_options: { is_disabled: true }
            })
        });
        if (!response.ok) console.warn(`Statistics Telegram delivery failed: HTTP ${response.status}.`);
    } catch {
        // Notification failure must not turn an accepted statistics record into an error.
        console.warn('Statistics Telegram delivery failed or timed out.');
    }
}

function formatTelegramMessage(data: ImportStats, clientInfo: ClientInfo): string {
    const location = `${clientInfo.city}, ${clientInfo.country}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}&utm_source=ADY-Web-Editor&utm_campaign=stats`;
    const locationLink = clientInfo.city !== 'unknown'
        ? `<a href="${escapeHtml(mapsUrl)}">${escapeHtml(location)}</a>`
        : escapeHtml(location);
    const lines = [
        `📍 ${locationLink}`,
        `<code>${escapeHtml(clientInfo.ip)}</code>`,
        `🖥️ ${escapeHtml(clientInfo.device)} - ${escapeHtml(clientInfo.browser)}`
    ];
    if (data.screenSize) lines.push(`📐 Screen: ${escapeHtml(data.screenSize)} CSS px`);
    lines.push(`\n${escapeHtml(data.model)}`);
    if (data.channels?.length) {
        lines.push(`\n${data.channels.map(channel => escapeHtml(decodeChannelName(channel))).join('\n')}`);
    }
    return lines.join('\n');
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
