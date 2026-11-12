import { classifyReceiver } from '../src/app/helper-functions/classify-receiver';
import { getClientDevice } from '../src/app/helper-functions/get-client-device';
import { decodeChannelName } from '../src/app/helper-functions/decode-channel-name';

interface Env {
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_CHAT_ID: string;
}

interface ClientInfo {
    ip: string;
    country: string;
    city: string;
    device: string;
    browser: string;
}

type ContactType = 'question' | 'feature' | 'bug';

interface ContactStats {
    model?: string;
    multEqType?: string;
    channels?: string[];
    appVersion?: string;
    screenSize?: string;
}

interface ContactPayload {
    type?: ContactType;
    message?: string;
    contact?: string;
    stats?: ContactStats;
}

const typeLabels: Record<ContactType, string> = {
    question: '❓ <b>Question</b>',
    feature: '💡 <b>Feature request</b>',
    bug: '🐛 <b>Bug report</b>',
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }): Promise<Response> => {
    try {
        // 1. Check content type
        const contentType = request.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            return new Response("Error: Expected JSON content type", { status: 400 });
        }

        // 2. Parse and validate the JSON
        const data: ContactPayload = await request.json();

        if (!data || typeof data !== "object" || Array.isArray(data)) {
            return new Response("Error: JSON body is empty or invalid", { status: 400 });
        }

        const message = typeof data.message === "string" ? data.message.trim() : "";
        if (!message) {
            return new Response("Error: Message is required", { status: 400 });
        }

        const type: ContactType = data.type === "feature" || data.type === "bug" ? data.type : "question";
        const contact = typeof data.contact === "string" ? data.contact.trim() : "";
        const stats = data.stats && typeof data.stats === "object" && !Array.isArray(data.stats)
            ? data.stats
            : undefined;

        // 3. Send a notification to Telegram when configured
        if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
            const clientInfo: ClientInfo | undefined = stats ? {
                ip: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
                country: request.cf?.country
                    ? new Intl.DisplayNames(["en"], { type: "region" }).of(request.cf.country) ?? request.cf.country
                    : "unknown",
                city: request.cf?.city || "unknown",
                ...getClientDevice(request.headers.get("user-agent"), request.headers.get("sec-ch-ua"))
            } : undefined;

            await sendToTelegram({ type, message, contact, stats }, clientInfo, env);
        }

        // 4. Return success response
        return new Response(JSON.stringify({ success: true, message: "Message sent" }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    } catch (err: any) {
        return new Response(`Server Error: ${err.message}`, { status: 500 });
    }
};

async function sendToTelegram(
    data: { type: ContactType; message: string; contact: string; stats?: ContactStats },
    clientInfo: ClientInfo | undefined,
    env: Env
) {
    const message = formatTelegramMessage(data, clientInfo);
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "HTML",
            link_preview_options: { is_disabled: true }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Telegram API error: ${response.status} ${errorText}`);
        throw new Error(`Telegram API error: ${response.status}`);
    }
}

function formatTelegramMessage(
    data: { type: ContactType; message: string; contact: string; stats?: ContactStats },
    clientInfo?: ClientInfo
): string {
    const lines = [
        typeLabels[data.type],
        "",
        escapeHtml(data.message)
    ];

    if (data.contact) {
        lines.push("", `👤 <b>Contact:</b> ${escapeHtml(data.contact)}`);
    }

    if (data.stats && clientInfo) {
        const location = `${clientInfo.city}, ${clientInfo.country}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}&utm_source=ADY-Web-Editor&utm_campaign=contact`;
        const locationLink = clientInfo.city !== "unknown"
            ? `<a href="${mapsUrl}">${escapeHtml(location)}</a>`
            : escapeHtml(location);

        lines.push(
            "",
            `📍 ${locationLink}`,
            `<code>${escapeHtml(clientInfo.ip)}</code>`,
            `🖥️ ${escapeHtml(clientInfo.device)} - ${escapeHtml(clientInfo.browser)}`
        );

        if (typeof data.stats.screenSize === "string" && data.stats.screenSize) {
            lines.push(`📐 Screen: ${escapeHtml(data.stats.screenSize)} CSS px`);
        }

        if (typeof data.stats.appVersion === "string" && data.stats.appVersion) {
            lines.push(`🏷️ Version: v${escapeHtml(data.stats.appVersion)}`);
        }

        if (typeof data.stats.model === "string" && data.stats.model) {
            const { brand, model } = classifyReceiver(data.stats.model);
            const receiverName = brand === "unknown" ? model : `${brand} ${model}`;
            const multEqSuffix = typeof data.stats.multEqType === "string" && data.stats.multEqType
                ? ` (${data.stats.multEqType})`
                : "";
            lines.push("", escapeHtml(`${receiverName}${multEqSuffix}`));
        }

        if (Array.isArray(data.stats.channels) && data.stats.channels.length > 0) {
            const channels = data.stats.channels
                .map((item: string) => escapeHtml(decodeChannelName(item)))
                .join("\n");
            lines.push("", channels);
        }
    }

    return lines.join("\n").slice(0, 4096);
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}
