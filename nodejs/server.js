import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import cron from 'node-cron';

const app = express();

const scrapeDiplomas = async () => {
    try {
        const { data } = await axios.get("https://diplomski.finki.ukim.mk/StartPage/DiplomaList");
        const $ = cheerio.load(data);
        const diplomas = [];

        $('.panel.panel-default').each((_, el) => {
            const title = $(el).find('.panel-heading b').text().trim();
            const info = {};

            $(el).find('table tr').each((_, row) => {
                const label = $(row).find('td').first().text().trim();
                const value = $(row).find('td').last().text().trim();

                if (label.includes('Студент')) info.student = value;
                else if (label.includes('Ментор')) info.mentor = value;
                else if (label.includes('Член 1')) info.member1 = value;
                else if (label.includes('Член 2')) info.member2 = value;
                else if (label.includes('Датум')) info.date = value;
                else if (label.includes('Време')) info.time = value;
            });

            diplomas.push({ title: title, ...info });
        });

        const filePath = 'src/assets/diplomas.json';
        let oldData = [];

        if (existsSync(filePath)) {
            oldData = JSON.parse(readFileSync(filePath, 'utf-8'));
        }

        // Compare old vs new data
        const isSame = JSON.stringify(diplomas) === JSON.stringify(oldData);

        if (!isSame) {
            writeFileSync(filePath, JSON.stringify(diplomas, null, 2));
            console.log(`[${new Date().toLocaleString()}] JSON updated. Changes detected.`);
        } else {
            console.log(`[${new Date().toLocaleString()}] No changes. JSON not updated.`);
        }

        return diplomas;
    } catch (err) {
        console.error("Scrape failed:", err.message);
        return null;
    }
};

// API Endpoint to manually fetch the diplomas
app.get('/api/diplomas', async (req, res) => {
    const diplomas = await scrapeDiplomas();
    if (diplomas) res.json("Successfully scraped data and saved to JSON file into diplomas.json.");
    else res.status(500).json({ error: "Failed to scrape data" });
});

// Run every day at 03:00 AM
cron.schedule('00 3 * * *', () => {
    console.log("⏰ Running scheduled diploma scraper...");
    scrapeDiplomas();
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
