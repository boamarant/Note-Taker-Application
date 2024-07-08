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

// "Wildcard route" to act as a fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/notes', (req, res) => {
// Reads db.json to access the notes
  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) throw err;
    res.json(JSON.parse(data));
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
  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) throw err; // Error handling
    const notes = JSON.parse(data); // Parses existing notes
    notes.push(newNote); // Includes the newly-created note in the array
    // Writes the updates notes array back to the db.json file
    fs.writeFile('db.json', JSON.stringify(notes, null, 2), (err) => {
      if (err) throw err;
      res.json(newNote);
    });
  });
});

// Handling note deletion
app.delete('/api/notes/:id', (req, res) => {
// Reads db.json for existing notes
  fs.readFile('db.json', 'utf8', (err, data) => {
    if (err) throw err; // Error handling
    let notes = JSON.parse(data); // Parses existing notes
    notes = notes.filter((note) => note.id !== req.params.id); // Deletes the selected note from the array
    // Writes the updates notes array back to the db.json file
    fs.writeFile('db.json', JSON.stringify(notes, null, 2), (err) => {
      if (err) throw err;
      res.sendStatus(204);
    });
  });
});

// Starts the server on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});