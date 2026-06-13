const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'goals.json');
// Middleware
app.use(express.json());
// Serve static client assets from the current directory
app.use(express.static(__dirname));
// Helper: Read goals from database
async function readDB() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist, start with an empty list
        if (err.code === 'ENOENT') {
            return [];
        }
        console.error('Error reading JSON DB:', err);
        return [];
    }
}
// Helper: Write goals to database
async function writeDB(data) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing to JSON DB:', err);
    }
}
// REST API Routes
// 1. GET all goals
app.get('/api/goals', async (req, res) => {
    const goals = await readDB();
    res.json(goals);
});
// 2. POST add a new goal
app.post('/api/goals', async (req, res) => {
    const { title, category, priority, targetDate } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Goal title is required' });
    }
    const goals = await readDB();
    const newGoal = {
        id: 'goal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        title,
        category: category || 'adventure',
        priority: priority || 'medium',
        targetDate: targetDate || '',
        completed: false,
        createdAt: Date.now()
    };
    goals.unshift(newGoal);
    await writeDB(goals);
    res.status(201).json(newGoal);
});
// 3. PUT update a goal
app.put('/api/goals/:id', async (req, res) => {
    const { id } = req.params;
    const { title, category, priority, targetDate, completed } = req.body;
    const goals = await readDB();
    const goalIndex = goals.findIndex(g => g.id === id);
    if (goalIndex === -1) {
        return res.status(404).json({ error: 'Goal not found' });
    }
    const goal = goals[goalIndex];
    
    // Update fields if provided in request body
    if (title !== undefined) goal.title = title;
    if (category !== undefined) goal.category = category;
    if (priority !== undefined) goal.priority = priority;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (completed !== undefined) goal.completed = completed;
    await writeDB(goals);
    res.json(goal);
});
// 4. DELETE a goal
app.delete('/api/goals/:id', async (req, res) => {
    const { id } = req.params;
    
    const goals = await readDB();
    const updatedGoals = goals.filter(g => g.id !== id);
    if (goals.length === updatedGoals.length) {
        return res.status(404).json({ error: 'Goal not found' });
    }
    await writeDB(updatedGoals);
    res.json({ message: 'Goal deleted successfully', id });
});
// Catch-all route to serve index.html for single-page app behavior
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
// Start listening
app.listen(PORT, () => {
    console.log(`Dream Bucket List server running at http://localhost:${PORT}`);
});