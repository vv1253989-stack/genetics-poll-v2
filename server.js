require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const AI_PROVIDER = 'gemini';

async function callAI(prompt) {
    if (AI_PROVIDER === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`},
            body: JSON.stringify({model: 'gpt-4o-mini', messages: [{role: 'user', content: prompt}]})
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices[0].message.content;
    } else {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=' + process.env.GEMINI_API_KEY;
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({contents: [{parts: [{text: prompt}]}]})
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.candidates[0].content.parts[0].text;
    }
}

app.post('/api/solve', async (req, res) => {
    const { question, options } = req.body;
    const prompt = 'Solve this genetics MCQ and explain the correct answer in 2-3 sentences. Give the correct option letter and a short explanation.\n\nQuestion: ' + question + '\n\nOptions:\nA) ' + options[0] + '\nB) ' + options[1] + '\nC) ' + options[2] + '\nD) ' + options[3];
    try {
        const solution = await callAI(prompt);
        res.json({solution});
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({solution: 'Error: ' + error.message});
    }
});

app.post('/api/translate', async (req, res) => {
    const { question, options } = req.body;
    const prompt = 'Translate the following MCQ question and its options to Hindi (Devanagari script). Translate EVERYTHING including common words like Genetics, Heredity, Variations, Genes. Only keep proper names (Mendel, Darwin, Morgan, Drosophila) and abbreviations (DNA, RNA) in English. Use simple Hindi.\n\nOutput STRICTLY in this exact format with no extra text:\nQUESTION: <hindi question here>\nOPTION_A: <hindi option A here>\nOPTION_B: <hindi option B here>\nOPTION_C: <hindi option C here>\nOPTION_D: <hindi option D here>\n\nEnglish Question: ' + question + '\nOptions:\nA) ' + options[0] + '\nB) ' + options[1] + '\nC) ' + options[2] + '\nD) ' + options[3];
    try {
        const solution = await callAI(prompt);
        res.json({solution});
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({solution: 'Error: ' + error.message});
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('✅ Server running on http://localhost:' + PORT);
});
