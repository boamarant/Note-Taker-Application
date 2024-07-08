const express = require('express'); // Express server framework
const path = require('path'); 
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Uses UUID to generate unique IDs

const app = express(); // Initializes express
const PORT = process.env.PORT || 3000; // Sets the port value

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/notes', (req, res) => {
// Reads db.json file to access the notes
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    try {
      const notes = JSON.parse(data);
      res.json(notes);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error parsing JSON');
    }
  });
});

// API route for adding new notes
app.post('/api/notes', (req, res) => {
// Creates a new note and assigns a unique ID to it
  const newNote = {
    id: uuidv4(),
    title: req.body.title,
    text: req.body.text,
  };
// Reads db.json for existing notes
fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      const notes = JSON.parse(data);
      notes.push(newNote);

      fs.writeFile('db/db.json', JSON.stringify(notes, null, 2), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error writing to DB' });
        }
        res.json(newNote);
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error parsing JSON' });
    }
  });
});

// Handling note deletion
app.delete('/api/notes/:id', (req, res) => {
// Reads db.json for existing notes
fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      let notes = JSON.parse(data);
      notes = notes.filter((note) => note.id !== req.params.id);

      fs.writeFile('db/db.json', JSON.stringify(notes, null, 2), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error writing to DB' });
        }
        res.sendStatus(204);
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error parsing JSON' });
    }
  });
});

// Starts the server on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});