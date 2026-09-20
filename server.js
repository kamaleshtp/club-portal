const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./portal.db', (err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to SQLite database.');
});

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, email TEXT UNIQUE, password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS clubs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, category TEXT, description TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT, club_name TEXT, event_date TEXT, location TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT, email TEXT UNIQUE, club TEXT, role TEXT DEFAULT 'Member'
    )`);

    // Seed default clubs if empty
    db.get('SELECT count(*) as count FROM clubs', (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO clubs (name, category, description) VALUES 
                ('Coding Club', 'Technology', 'Build cool software and practice DSA.'),
                ('Robotics Club', 'Engineering', 'Hardware hacking, IoT, and bot wars.'),
                ('Design Club', 'Arts & Design', 'UI/UX design, graphics, and 3D modeling.')`);
            
            db.run(`INSERT INTO events (title, club_name, event_date, location) VALUES 
                ('Hackathon 2026', 'Coding Club', '2026-09-15', 'Lab 3'),
                ('Bot Fighting Championship', 'Robotics Club', '2026-10-01', 'Main Arena')`);
        }
    });
});

// AUTH ENDPOINTS 
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], function(err) {
        if (err) return res.status(400).json({ error: 'User/Email already exists' });
        res.status(201).json({ status: 'success', message: 'User registered successfully!' });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT id, name, email FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err || !row) return res.status(401).json({ error: 'Invalid credentials' });
        res.json({ status: 'success', user: row });
    });
});

// CLUBS ENDPOINTS
app.get('/api/clubs', (req, res) => {
    db.all('SELECT * FROM clubs', [], (err, rows) => res.json({ status: 'success', data: rows }));
});

//EVENTS ENDPOINTS
app.get('/api/events', (req, res) => {
    db.all('SELECT * FROM events ORDER BY id DESC', [], (err, rows) => res.json({ status: 'success', data: rows }));
});

app.post('/api/events', (req, res) => {
    const { title, club_name, event_date, location } = req.body;
    if (!title || !club_name || !event_date || !location) {
        return res.status(400).json({
            error: 'Title, club name, event date and location are required'
        });
    }
    const cleanClub = club_name.trim();
    db.get(
        'SELECT id FROM clubs WHERE LOWER(name) = LOWER(?)',
        [cleanClub],
        (clubErr, existingClub) => {

            if (clubErr) {
                return res.status(500).json({
                    error: clubErr.message
                });
            }
            if (!existingClub) {
                return res.status(400).json({
                    error: `Club '${cleanClub}' does not exist. Please select a valid club.`
                });
            }
            db.run(
                `INSERT INTO events 
                (title, club_name, event_date, location)
                VALUES (?, ?, ?, ?)`,
                [title, cleanClub, event_date, location],
                function(err) {

                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }
                    res.status(201).json({
                        status: 'success',
                        message: 'Event added!'
                    });
                }
            );
        }
    );
});

app.put('/api/events/:id', (req, res) => {
    const { title, club_name, event_date, location } = req.body;
    db.run(
        'UPDATE events SET title = ?, club_name = ?, event_date = ?, location = ? WHERE id = ?',
        [title, club_name, event_date, location, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Event not found' });
            res.json({ status: 'success', message: 'Event updated successfully' });
        }
    );
});

app.patch('/api/events/:id', (req, res) => {
    const allowed = ['title', 'club_name', 'event_date', 'location'];
    const updates = [];
    const values = [];

    for (const field of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'At least one valid field is required' });
    }

    values.push(req.params.id);
    db.run(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Event not found' });
        res.json({ status: 'success', message: 'Event partially updated successfully' });
    });
});

app.delete('/api/events/:id', (req, res) => {
    db.run('DELETE FROM events WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Event not found' });
        res.json({ status: 'success', message: 'Event deleted successfully' });
    });
});

//MEMBERS ENDPOINTS
app.get('/api/members', (req, res) => {
    db.all('SELECT * FROM members ORDER BY id DESC', [], (err, rows) => res.json({ status: 'success', data: rows }));
});

app.post('/api/members', (req, res) => {
    const { fullName, email, club } = req.body;
    if (!fullName || !email || !club) {
        return res.status(400).json({
            error: 'Full name, email and club are required'
        });
    }
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanClub = club.trim();
    db.get(
        'SELECT id FROM clubs WHERE LOWER(name) = LOWER(?)',
        [cleanClub],
        (clubErr, existingClub) => {

            if (clubErr) {
                return res.status(500).json({
                    error: clubErr.message
                });
            }
            if (!existingClub) {
                return res.status(400).json({
                    error: `Club '${cleanClub}' does not exist. Please select a valid club.`
                });
            }
            db.get(
                'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
                [cleanEmail],
                (userErr, user) => {

                    if (userErr) {
                        return res.status(500).json({
                            error: userErr.message
                        });
                    }

                    if (!user) {
                        return res.status(400).json({
                            error: 'User is not registered. Please register before becoming a club member.'
                        });
                    }
                    db.run(
                        `INSERT INTO members (fullName, email, club)
                         VALUES (?, ?, ?)`,
                        [cleanName, cleanEmail, cleanClub],
                        function (insertErr) {

                            if (insertErr) {
                                if (insertErr.message.includes('UNIQUE constraint failed')) {
                                    return res.status(400).json({
                                        error: 'User is already a club member'
                                    });
                                }
                                return res.status(400).json({
                                    error: insertErr.message
                                });
                            }
                            res.status(201).json({
                                status: 'success',
                                message: 'Member registered to club!'
                            });
                        }
                    );
                }
            );
        }
    );
});
app.put('/api/members/:id', (req, res) => {
    const { fullName, email, club, role } = req.body;
    if (!fullName || !email || !club) {
        return res.status(400).json({ error: 'Full name, email and club are required' });
    }

    db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()], (lookupErr, user) => {
        if (lookupErr) return res.status(500).json({ error: lookupErr.message });
        if (!user) {
            return res.status(400).json({
                error: 'User is not registered. Please register before becoming a club member.'
            });
        }

        db.run(
            'UPDATE members SET fullName = ?, email = ?, club = ?, role = ? WHERE id = ?',
            [fullName.trim(), email.trim(), club, role || 'Member', req.params.id],
            function(err) {
                if (err) return res.status(400).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Member not found' });
                res.json({ status: 'success', message: 'Member updated successfully' });
            }
        );
    });
});

app.patch('/api/members/:id', (req, res) => {
    const allowed = ['fullName', 'email', 'club', 'role'];
    const updates = [];
    const values = [];

    for (const field of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'At least one valid field is required' });
    }

    const emailIndex = allowed.indexOf('email');
    const emailWasUpdated = Object.prototype.hasOwnProperty.call(req.body, 'email');

    const runUpdate = () => {
        values.push(req.params.id);
        db.run(`UPDATE members SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
            if (err) return res.status(400).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Member not found' });
            res.json({ status: 'success', message: 'Member partially updated successfully' });
        });
    };

    if (emailWasUpdated) {
        const emailValue = req.body.email;
        db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [String(emailValue).trim()], (lookupErr, user) => {
            if (lookupErr) return res.status(500).json({ error: lookupErr.message });
            if (!user) {
                return res.status(400).json({
                    error: 'User is not registered. Please register before becoming a club member.'
                });
            }
            values[emailIndex] = String(emailValue).trim();
            runUpdate();
        });
    } else {
        runUpdate();
    }
});

app.delete('/api/members/:id', (req, res) => {
    db.run('DELETE FROM members WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Member not found' });
        res.json({ status: 'success', message: 'Member deleted' });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dashboard running on port ${PORT}`);
});
