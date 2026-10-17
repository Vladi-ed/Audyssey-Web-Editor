export function classifyReceiver(value: unknown): { brand: string; model: string; tier: string } {
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
