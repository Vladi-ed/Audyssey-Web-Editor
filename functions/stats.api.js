export const onRequestPost = async (context) => {
    try {
        const { request, env } = context;

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
                country: request.cf?.country || "unknown",
                city: request.cf?.city || "unknown"
            };
            await sendToTelegram(data, clientInfo, env);
        }

        // 4. Return success response
        return new Response(JSON.stringify({ success: true, message: "Record received" }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    } catch (err) {
        return new Response(`Server Error: ${err.message}`, { status: 500 });
    }
};

async function sendToTelegram(data, clientInfo, env) {
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

function formatTelegramMessage(data, clientInfo) {
    const lines = [
        "<b>📊 New Stats Record</b>",
        "",
        `<b>📍 Location:</b> ${escapeHtml(clientInfo.city)}, ${escapeHtml(clientInfo.country)}`,
        `<b>🌐 IP:</b> <code>${escapeHtml(clientInfo.ip)}</code>`,
        ""
    ];

    for (const [key, value] of Object.entries(data)) {
        const displayKey = escapeHtml(key.replace(/([A-Z])/g, " $1").trim());

        let displayValue;
        if (Array.isArray(value)) {
            displayValue = value.join(", ");
        } else if (typeof value === "object" && value !== null) {
            displayValue = JSON.stringify(value);
        } else {
            displayValue = String(value);
        }

        lines.push(`<b>${displayKey}:</b> ${escapeHtml(displayValue)}`);
    }

    return lines.join("\n").slice(0, 4096);
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}
