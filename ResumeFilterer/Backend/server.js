
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const textract = require('textract');
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mammoth = require('mammoth'); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: 'Osman123.q',
    database: 'cvapp'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Multer setup for file upload
const upload = multer({ dest: 'uploads/' });



const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const sanitize = (text) => (text || '').replace(/\*\*/g, '').trim();

// Endpoint to upload a resume and summarize it using Google Generative AI
app.post('/upload-resume', upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let fileContent = '';
    const userid = req.body.userid || localStorage.getItem('iduser'); // Retrieve user ID from the request or localStorage

    try {
        // Extract file content based on the file type
        if (fileExtension === '.pdf') {
            const fileBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(fileBuffer);
            fileContent = data.text;
        } else if (fileExtension === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            fileContent = result.value;
        } else if (fileExtension === '.doc') {
            fileContent = await new Promise((resolve, reject) => {
                textract.fromFileWithPath(filePath, (error, text) => {
                    if (error) reject(error);
                    else resolve(text);
                });
            });
        } else if (fileExtension === '.txt') {
            fileContent = fs.readFileSync(filePath, 'utf8');
        } else {
            return res.status(400).json({ success: false, message: 'Unsupported file type' });
        }

        // Clean and preprocess content
        fileContent = fileContent.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

        // Chunk the content if it's too long
        const chunks = fileContent.match(/.{1,4000}/g);

        let summary = '';
        for (let chunk of chunks) {
            const prompt = `Summarize the resume in this format: Name: , Location: , Phone number: , Email: , Profession , Key skills: , Certificates: , Education: , Experiences:,  Years of experience:, Additional Info:. Calculate the exact number to years of experience. If he/she didn't worked anywhere related to his her profession "years of experience" should be 0. If you cant find any information write not specified. You can assume the candidates location. Write your thoughts into additional info part\n\n${chunk}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            summary += response.text();
        }

        // Parse the summary into individual fields and sanitize them
       // Parse the summary into individual fields and sanitize them
const parsedSummary = {
    name: sanitize(summary.match(/Name:\s*(.*)/)?.[1] || 'Not specified'),
    location: sanitize(summary.match(/Location:\s*(.*)/)?.[1] || 'Not specified'),
    phonenum: sanitize(summary.match(/Phone number:\s*(.*)/)?.[1] || 'Not provided'),
    email: sanitize(summary.match(/Email:\s*(.*)/)?.[1] || 'Not provided'),
    profession: sanitize(summary.match(/Profession:\s*(.*)/)?.[1] || 'Not specified'),
    keyskills: sanitize(summary.match(/Key skills:\s*(.*)/)?.[1] || 'Not provided'),
    certifications: sanitize(summary.match(/Certificates:\s*(.*)/)?.[1] || 'Not provided'),
    education: sanitize(summary.match(/Education:\s*(.*)/)?.[1] || 'Not specified'),
    
    // Capture all experiences, including all positions and companies
    experience: sanitize(summary.match(/Experiences?:\s*((?:[^Y]+)(?:\s*-\s*.*)+)/)?.[1] || 'Not specified'), 

    experienceyear: parseInt(sanitize(summary.match(/Years of experience:\s*(\d+)/)?.[1]), 10) || 0,
    additionalinfo: sanitize(summary.match(/Additional Info:\s*([\s\S]*)/)?.[1] || 'Not specified'),
};

        // Insert the sanitized summary into the database
        const sql = `INSERT INTO resumesum 
                     (userid, name, location, phonenum, email, profession, keyskills, certifications, education, experience, experienceyear, additionalinfo)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(sql, [
            userid, 
            parsedSummary.name, 
            parsedSummary.location, 
            parsedSummary.phonenum, 
            parsedSummary.email, 
            parsedSummary.profession, 
            parsedSummary.keyskills, 
            parsedSummary.certifications, 
            parsedSummary.education, 
            parsedSummary.experience, 
            parsedSummary.experienceyear,
            parsedSummary.additionalinfo
        ], (err, result) => {
            if (err) {
                console.error('Error inserting resume summary into database:', err);
                return res.status(500).json({ success: false, message: 'Error saving summary to database' });
            }
            res.status(200).json({ success: true, summary: summary });
        });

    } catch (error) {
        console.error('Error processing resume:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error summarizing resume', 
            error: error.message 
        });
    } finally {
        // Clean up the uploaded file
        fs.unlinkSync(filePath);
    }
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM user WHERE email = ? AND password = ?";
    db.query(sql, [username, password], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length > 0) {
            const iduser = data[0].iduser; 
            return res.status(200).json({ success: true, iduser: iduser });
        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    });
});

app.post('/delete-resumes', (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'No resumes selected for deletion' });
    }

    const sql = 'DELETE FROM resumesum WHERE idresumesum IN (?)';
    db.query(sql, [ids], (err, result) => {
        if (err) {
            console.error('Error deleting resumes:', err);
            return res.status(500).json({ success: false, message: 'Error deleting resumes' });
        }
        res.status(200).json({ success: true, message: `${result.affectedRows} resumes deleted` });
    });
});

// Endpoint to get all resumes
app.get('/resumes', (req, res) => {
    const { userId } = req.query; // Retrieve userId from query parameters
    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const sql = 'SELECT idresumesum, name, location, phonenum, email, profession, keyskills, certifications, education, experience, experienceyear, additionalinfo FROM resumesum WHERE userid = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching resumes:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.status(200).json({ success: true, resumes: results });
    });
});
app.get('/resumes/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM resumesum WHERE idresumesum = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (result.length === 0) return res.status(404).json({ success: false, message: 'Resume not found' });
        res.status(200).json({ success: true, resume: result[0] });
    });
});


// Endpoint to get distinct values for filters
app.get('/filter-options', (req, res) => {
    const sql = `
        SELECT DISTINCT profession, education, location, keyskills, experienceyear
        FROM resumesum
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        // Split keyskills into individual skills
        const allSkills = results.flatMap(result => result.keyskills.split(',').map(skill => skill.trim()));
        const uniqueSkills = [...new Set(allSkills)]; // Remove duplicates

        const filterOptions = {
            professions: [...new Set(results.map(opt => opt.profession))],
            educationLevels: [...new Set(results.map(opt => opt.education))],
            locations: [...new Set(results.map(opt => opt.location))],
            keyskills: uniqueSkills
        };

        res.status(200).json({ success: true, options: filterOptions });
    });
});

// Endpoint to get email template
app.get('/getTemplate/:userid', (req, res) => {
    const userId = req.params.userid;
    const sql = 'SELECT email FROM emailtemp WHERE userid = ?'; // Fetch template by user ID
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching template:', err);
            return res.status(500).json({ success: false, message: 'Database query error' });
        }
        if (result.length > 0) {
            res.status(200).json({ success: true, template: result[0].email });
        } else {
            res.status(404).json({ success: false, message: 'Template not found for this user' });
        }
    });
});

app.post('/saveTemplate', (req, res) => {
    const { template, userId } = req.body;
    const sql = 'UPDATE emailtemp SET email = ? WHERE userid = ?'; // Save template by user ID
    db.query(sql, [template, userId], (err, result) => {
        if (err) {
            console.error('Error saving template:', err);
            return res.status(500).json({ success: false, message: 'Database update error' });
        }
        res.status(200).json({ success: true, message: 'Template updated successfully' });
    });
});

app.listen(8081, () => {
    console.log("Server is running on port 8081");
});