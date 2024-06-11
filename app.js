const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/performance-test', async (req, res) => {
    const { url } = req.body;

    try {
        const startTime = Date.now();
        const response = await fetch(url);
        const endTime = Date.now();
        const ttfb = endTime - startTime;

        const html = await response.text();
        const seoIssues = [];
        const deadLinks = [];

        if (!html.includes('<meta name="description"')) {
            seoIssues.push('Missing meta description');
        }
        if (!html.includes('<h1>')) {
            seoIssues.push('Missing H1 tag');
        }
        if (!html.includes('<h2>')) {
            seoIssues.push('Missing H2 tag');
        }
        const altMissing = html.match(/<img [^>]*alt=""/g);
        if (altMissing) {
            seoIssues.push('Images without alt attributes');
        }

        const linkMatches = html.match(/href="(http[^"]*)"/g);
        if (linkMatches) {
            for (const match of linkMatches) {
                const link = match.slice(6, -1);
                try {
                    const linkResponse = await fetch(link);
                    if (!linkResponse.ok) {
                        deadLinks.push(link);
                    }
                } catch {
                    deadLinks.push(link);
                }
            }
        }

        res.json({ ttfb, seoIssues, deadLinks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
