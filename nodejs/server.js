import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

const app = express();

app.get('/api/diplomas', async (req, res) => {
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

            diplomas.push({ title, ...info });
        });

        res.json(diplomas);

        writeFileSync('src/assets/diplomas.json', JSON.stringify(diplomas, null, 2));

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to scrape data" });
    }
});



app.listen(3001, () => console.log("Server running on http://localhost:3001"));
