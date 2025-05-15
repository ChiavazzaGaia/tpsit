const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // Import body-parser
const fs = require('fs'); // Import fs to write to a file
const app = express();
const port = 3000;

// Middleware to parse URL-encoded data (form submissions)
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Route to handle form submission
app.post('/submit', (req, res) => {
    const userInput = req.body; // Access the submitted data
    // Save the data to a file (data.txt)
    fs.appendFile('data.txt', JSON.stringify(userInput) + '\n', (err) => {
        if (err) {
            return res.status(500).send('Error saving data');
        }
    });
    fs.readFile('data.txt', 'utf8', (readErr, data) => {
        if (readErr) {
            console.error('Error reading file for trimming:', readErr);
            return;
        }

        const lines = data.split('\n').filter(line => line.trim() !== '');

        if (lines.length > 10) {
            const trimmed = lines.slice(-10).join('\n') + '\n';
            fs.writeFile('data.txt', trimmed, 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Error trimming file:', writeErr);
                }
            });
        }
    });

});

app.post('/account', (req, res) => {
    const { username, password, action } = req.body;
    const userData = { username, password};

    if (action === 'signup') {
        fs.readFile('accountsLogin.txt', 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                return res.status(500).send('Error reading accounts');
            }

            const accounts = data
                .split('\n')
                .filter(line => line.trim() !== '')
                .map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return null;
                    }
                })
                .filter(account => account !== null);

            const userExists = accounts.some(account => account.username === username);

            if (userExists) {
                return;
            }

            fs.appendFile('accountsLogin.txt', JSON.stringify(userData) + '\n', err => {
                if (err) {
                    return res.status(500).send('Error saving account');
                }
                return;
            });
        });
    } else if (action === 'login') {
        // Handle login logic
    } else {
        res.status(400).send('Unknown action');
    }
});

// Route to get all submitted data
app.get('/data', (req, res) => {
    fs.readFile('data.txt', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading data' });
        }

        try {
            // Split lines, filter out empty lines, and parse each line as a JSON object
            const parsedData = data.split('\n')
                                    .filter(line => line) // Remove empty lines
                                    .map(line => JSON.parse(line)); // Parse each line as JSON

            res.json(parsedData.reverse());  // Send back the data as JSON, reversed
        } catch (parseError) {
            return res.status(500).json({ error: 'Error parsing data: ' + parseError.message });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});