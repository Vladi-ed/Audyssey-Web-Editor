export function getClientDevice(userAgent: string): { device: string; browser: string } {
    let device = 'unknown';

    if (/iPad/i.test(userAgent)) {
        device = 'iPad';
    } else if (/iPhone|iPod/i.test(userAgent)) {
        device = 'iPhone / iPod';
    } else if (/Android/i.test(userAgent)) {
        device = /Mobile/i.test(userAgent) ? 'Android phone' : 'Android tablet';
    } else if (/Windows NT/i.test(userAgent)) {
        device = 'Windows PC';
    } else if (/CrOS/i.test(userAgent)) {
        device = 'Chromebook';
    } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
        device = 'Mac';
    } else if (/Linux/i.test(userAgent)) {
        device = 'Linux computer';
    }

    // Check Chromium variants before Chrome, and Safari last because their headers overlap.
    const browsers: [string, RegExp][] = [
        ['Edge', /(?:Edg|EdgA|EdgiOS)\/([\d.]+)/i],
        ['Opera', /(?:OPR|OPiOS)\/([\d.]+)/i],
        ['Samsung Internet', /SamsungBrowser\/([\d.]+)/i],
        ['Chrome', /(?:Chrome|CriOS)\/([\d.]+)/i],
        ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/i],
        ['Safari', /Version\/([\d.]+).*Safari/i]
    ];

    for (const [name, pattern] of browsers) {
        const match = pattern.exec(userAgent);
        if (match) {
            return { device, browser: `${name} ${match[1]}` };
        }
    }

    return { device, browser: 'unknown' };
}
