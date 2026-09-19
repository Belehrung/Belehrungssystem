const { chromiumStarten } = require('/home/user/gymdocu/test/helfer/chromium-start.js');
const fs = require('fs');
const path = require('path');
(async () => {
    const verz = __dirname;
    const dateien = fs.readdirSync(verz).filter((f) => f.endsWith('.html')).sort();
    const browser = await chromiumStarten([]);
    for (const datei of dateien) {
        const page = await browser.newPage();
        await page.goto('file://' + path.join(verz, datei), { waitUntil: 'load' });
        const ziel = path.join(verz, datei.replace(/\.html$/, '.pdf'));
        await page.pdf({
            path: ziel, format: 'A4', printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: '<div style="width:100%;font-family:Liberation Sans,sans-serif;font-size:7.5pt;color:#8a949e;text-align:center;padding-top:4mm;">'
                          + '<span class="pageNumber"></span> / <span class="totalPages"></span></div>',
            margin: { top: '22mm', right: '20mm', bottom: '18mm', left: '20mm' },
        });
        await page.close();
        const kb = Math.round(fs.statSync(ziel).size / 1024);
        console.log(`${path.basename(ziel)}  ${kb} KB`);
    }
    await browser.close();
})().catch((e) => { console.error('FEHLER:', e.message); process.exit(1); });
