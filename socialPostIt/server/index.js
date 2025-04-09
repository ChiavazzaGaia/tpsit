const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // Import body-parser
const fs = require('fs'); // Import fs to write to a file
const app = express();
const port = 3000;

// Middleware to parse URL-encoded data (form submissions)
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public')); // Serve static files from the 'public' directory

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'main.htm'));
})

// Route to handle form submission
app.post('/submit', (req, res) => {
    const userInput = req.body; // Access the submitted data
    // Save the data to a file (data.txt)
    fs.appendFile('data.txt', JSON.stringify(userInput) + '\n', (err) => {
        if (err) {
            return res.status(500).send('Error saving data');
        }
        res.send();
    });
});

// Route to get all submitted data
app.get('/data', (req, res) => {
    fs.readFile('data.txt', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data');
        }
        // Send the data back to the client
        res.send(data.split('\n').filter(line => line).map(line => JSON.parse(line)));
        console.log(data);
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});