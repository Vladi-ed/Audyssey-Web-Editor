import { decodeChannelName } from '../src/app/helper-functions/decode-channel-name.pipe';

interface Env { TELEGRAM_BOT_TOKEN: string, TELEGRAM_CHAT_ID: string }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }): Promise<Response> => {
    try {
        // 1. Check content type
        const contentType = request.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            return new Response("Error: Expected JSON content type", { status: 400 });
        }

        // 2. Parse and validate the JSON
        const data = await request.json();

        if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length === 0) {
            return new Response("Error: JSON body is empty or invalid", { status: 400 });
        }

        // 3. Send a notification to Telegram when configured
        if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
            const clientInfo = {
                ip: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
                country: request.cf?.country
                    ? new Intl.DisplayNames(["en"], { type: "region" }).of(request.cf.country) ?? request.cf.country
                    : "unknown",
                city: request.cf?.city || "unknown"
            };
            await sendToTelegram(data, clientInfo, env);
        }

        // 4. Return success response
        return new Response(JSON.stringify({ success: true, message: "Record received" }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    } catch (err: any) {
        return new Response(`Server Error: ${err.message}`, { status: 500 });
    }
};

async function sendToTelegram(data: any, clientInfo, env: any) {
    const message = formatTelegramMessage(data, clientInfo);
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "HTML"
        })
    });

    if (!response.ok) {
        console.error(`Telegram API error: ${response.status} ${await response.text()}`);
    }
}

function formatTelegramMessage(data: any, clientInfo: any): string {
    const location = `${clientInfo.city}, ${clientInfo.country}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    const locationLink = clientInfo.city !== "unknown"
        ? `<a href="${mapsUrl}">${location}</a>`
        : location;

    const lines = [
        `<b>📍 Location:</b> ${locationLink}`,
        `<b>🌐 IP:</b> <code>${escapeHtml(clientInfo.ip)}</code>`,
        ""
    ];

    for (const value of Object.values(data)) {
        let displayValue: string;
        if (Array.isArray(value)) {
            displayValue = value
                .map((item: string) => escapeHtml(decodeChannelName(item)))
                .join("\n");
        } else if (typeof value === "object" && value !== null) {
            displayValue = escapeHtml(JSON.stringify(value));
        } else {
            displayValue = escapeHtml(String(value));
        }

        lines.push(`\n${displayValue}`);
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
