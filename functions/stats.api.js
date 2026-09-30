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

        // 3. Generate a unique key for the new record
        const country = request.cf?.country || "unknown";
        const key = `stat_${Date.now()}_${country}_${crypto.randomUUID()}`;

        // 4. Save to KV
        await env.KV.put(key, JSON.stringify(data));

        // 5. Send a notification to Telegram when configured
        if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
            await sendToTelegram(data, env);
        }

        // 6. Return success response
        return new Response(JSON.stringify({ success: true, id: key, message: "Record saved" }), {
            headers: { "Content-Type": "application/json" },
            status: 201
        });
    } catch (err) {
        return new Response(`Server Error: ${err.message}`, { status: 500 });
    }
};

async function sendToTelegram(data, env) {
    const message = formatTelegramMessage(data);
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

function formatTelegramMessage(data) {
    const lines = [
        "<b>📊 New Stats Record</b>",
        `<i>${new Date().toISOString()}</i>`,
        ""
    ];

    for (const [key, value] of Object.entries(data)) {
        const displayKey = escapeHtml(key.replace(/([A-Z])/g, " $1").trim());
        const displayValue = typeof value === "object" && value !== null
            ? JSON.stringify(value)
            : String(value);
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
