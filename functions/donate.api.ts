import { classifyReceiver } from '../src/app/helper-functions/classify-receiver';
import { getClientDevice } from '../src/app/helper-functions/get-client-device';

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

export const onRequestPost: PagesFunction<Env> = async ({ request, env }): Promise<Response> => {
    try {
        const rawModel = (await request.text()).trim();
        let receiverName: string | undefined;
        if (rawModel) {
            const { brand, model } = classifyReceiver(rawModel);
            receiverName = brand === "unknown" ? model : `${brand} ${model}`;
        }

        if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
            const clientInfo: ClientInfo = {
                ip: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
                country: request.cf?.country
                    ? new Intl.DisplayNames(["en"], { type: "region" }).of(request.cf.country) ?? request.cf.country
                    : "unknown",
                city: request.cf?.city || "unknown",
                ...getClientDevice(request.headers.get("user-agent"), request.headers.get("sec-ch-ua"))
            };

            await sendToTelegram(receiverName, clientInfo, env);
        }

        return new Response(JSON.stringify({ success: true, message: "Record received" }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    } catch (err: any) {
        return new Response(`Server Error: ${err.message}`, { status: 500 });
    }
};

async function sendToTelegram(receiverName: string | undefined, clientInfo: ClientInfo, env: Env) {
    const message = formatTelegramMessage(receiverName, clientInfo);
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
        console.error(`Telegram API error: ${response.status} ${await response.text()}`);
    }
}

function formatTelegramMessage(receiverName: string | undefined, clientInfo: ClientInfo): string {
    const location = `${clientInfo.city}, ${clientInfo.country}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}&utm_source=ADY-Web-Editor&utm_campaign=donate`;
    const locationLink = clientInfo.city !== "unknown"
        ? `<a href="${mapsUrl}">${escapeHtml(location)}</a>`
        : escapeHtml(location);

    const lines = [
        "☕ <b>Donate</b>",
        "",
        `📍 ${locationLink}`,
        `<code>${escapeHtml(clientInfo.ip)}</code>`,
        `🖥️ ${escapeHtml(clientInfo.device)} - ${escapeHtml(clientInfo.browser)}`
    ];

    if (receiverName) {
        lines.push("", escapeHtml(receiverName));
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
