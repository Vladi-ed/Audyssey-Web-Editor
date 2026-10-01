import { decodeChannelName } from '../src/app/helper-functions/decode-channel-name.pipe';

interface Env { TELEGRAM_BOT_TOKEN: string, TELEGRAM_CHAT_ID: string, STATS: AnalyticsEngineDataset; }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }): Promise<Response> => {
    try {
        // 1. Check content type
        const contentType = request.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            return new Response("Error: Expected JSON content type", { status: 400 });
        }

        // 2. Parse and validate the JSON
        const data: {model: string, channels?: string[]} = await request.json();

        if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length === 0) {
            return new Response("Error: JSON body is empty or invalid", { status: 400 });
        }

        // Record the validated request
        const { brand, model, tier } = classifyReceiver(data.model);

        env.STATS?.writeDataPoint({
            blobs: [
                brand,
                model,
                tier,
                JSON.stringify(Array.isArray(data.channels) ? data.channels : [])
            ]
        });

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

function classifyReceiver(value: unknown): { brand: string; model: string; tier: string } {
    const fullModel = typeof value === "string" ? value.trim() : "";
    let brand: string;
    let model: string;

    if (fullModel.startsWith("*AVR-")) {
        brand = "Denon";
        model = fullModel.slice(1);
    } else if (fullModel.startsWith("*SR")) {
        brand = "Marantz";
        model = fullModel.slice(1);
    } else {
        const [firstWord, ...rest] = fullModel.split(/\s+/);
        brand = rest.length ? firstWord : "unknown";
        model = rest.length ? rest.join(" ") : fullModel || "unknown";
    }

    let tier = "unknown";

    if (brand === "Denon") {
        if (/^(?:AVR|AVC)-A/i.test(model)) {
            tier = "premium";
        } else if (/^(?:AVR|AVC)-S\d/i.test(model)) {
            tier = "budget";
        } else {
            const xSeries = /^(?:AVR|AVC)-X(\d)/i.exec(model);
            if (xSeries) {
                const series = Number(xSeries[1]);
                tier = series === 1 ? "budget" : series >= 2 && series <= 3 ? "mid-range" : series >= 4 ? "premium" : "unknown";
            }
        }
    } else if (brand === "Marantz") {
        const srSeries = /^SR(\d{2})/i.exec(model);
        const cinemaSeries = /^CINEMA\s+(\d{2})/i.exec(model);

        if (/^AV\s*(?:10|20|30)$/i.test(model) || /^AV(?:77|88)\d{2}$/i.test(model)) {
            tier = "premium";
        } else if (cinemaSeries) {
            const series = Number(cinemaSeries[1]);
            tier = series >= 70 ? "budget" : series >= 50 ? "mid-range" : "premium";
        } else if (/^NR1[67]\d{2}$/i.test(model)) {
            tier = "budget";
        } else if (srSeries) {
            const series = Number(srSeries[1]);
            tier = series === 50 ? "mid-range" : series >= 60 ? "premium" : "unknown";
        }
    }

    return { brand, model, tier };
}

async function sendToTelegram(data: any, clientInfo, env: any) {
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
        console.error(`Telegram API error: ${response.status} ${await response.text()}`);
    }
}

function formatTelegramMessage(data: any, clientInfo: any): string {
    const location = `${clientInfo.city}, ${clientInfo.country}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}&utm_source=ADY-Web-Editor&utm_campaign=stats`;
    const locationLink = clientInfo.city !== "unknown"
        ? `<a href="${mapsUrl}">${location}</a>`
        : location;

    const lines = [
        `<b>📍 Location:</b> ${locationLink}`,
        `<b>🌐 IP:</b> <code>${clientInfo.ip}</code>`
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
