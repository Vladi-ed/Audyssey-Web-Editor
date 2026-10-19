export function getClientDevice(userAgent: string | null, clientHints: string | null) {
    userAgent ??= '';
    clientHints ??= '';

    const device = getDevice(userAgent);

    // Check Chromium variants before Chrome, and Safari last because their headers overlap.
    const browsers: [string, RegExp][] = [
        ['Edge', /(?:Edg|EdgA|EdgiOS)\/([\d.]+)/i],
        ['Opera', /(?:OPR|OPiOS)\/([\d.]+)/i],
        ['Samsung Internet', /SamsungBrowser\/([\d.]+)/i],
        ['Chrome', /(?:Chrome|CriOS)\/([\d.]+)/i],
        ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/i]
    ];

    let browser = 'unknown';
    let version = '';

    for (const [name, pattern] of browsers) {
        const match = pattern.exec(userAgent);
        if (match) {
            browser = name;
            version = match[1].split('.')[0];
            break;
        }
    }

    if (browser === 'unknown' && /Safari/i.test(userAgent)) {
        const match = /Version\/([\d.]+)/i.exec(userAgent);
        if (match) {
            browser = 'Safari';
            version = match[1].split('.')[0];
        }
    }

    const brands: [string, string][] = [
        ['Microsoft Edge', 'Edge'],
        ['Opera', 'Opera'],
        ['Samsung Internet', 'Samsung Internet'],
        ['Brave', 'Brave'],
        ['Google Chrome', 'Chrome'],
        ['Chromium', 'Chromium']
    ];
    const hints = [...clientHints.matchAll(/"([^"]+)"\s*;\s*v="(\d+)(?:\.[\d.]+)?"/g)];

    for (const [brand, name] of brands) {
        const hint = hints.find(match => match[1] === brand);
        if (hint && (browser === 'unknown' || browser === 'Chrome' || browser === name)) {
            browser = name;
            version = hint[2];
            break;
        }
    }

    return { device, browser: version ? `${browser} ${version}` : browser };
}

function getDevice(userAgent: string): string {
    if (/iPad/i.test(userAgent)) return 'iPad';
    if (/iPhone|iPod/i.test(userAgent)) return 'iPhone / iPod';
    if (/Android/i.test(userAgent)) return /Mobile/i.test(userAgent) ? 'Android phone' : 'Android tablet';
    if (/Windows NT/i.test(userAgent)) return 'Windows';
    if (/CrOS/i.test(userAgent)) return 'Chromebook';
    if (/Macintosh|Mac OS X/i.test(userAgent)) return 'Mac';
    if (/Linux/i.test(userAgent)) return 'Linux';

    return 'unknown';
}
