const express = require('express');
const app = express();
const path = require('path')
const db = require('./db')
app.use(express.json());

app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res, next) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/users/detail/:id', (req, res, next)=> {
    User.findByPk(req.params.id)
        .then(user => {
            if(!user){
                throw ({ status: 401 });
            }
            res.send(user)
        })
        .catch(next)
});

app.get('/api/users/random', async(req,res,next) => {
    try{
        const users = await User.findAll();
        const user = users[Math.floor(Math.random()*users.length)];
        res.send(user);
    }
    catch(ex){
        next(ex);
    }
});

app.post('/api/users/:userId/notes', (req, res, next) => {
    Note.create({ ...req.body, userId: req.params.userId })
        .then(note => res.status(201).send(note))
        .catch(next);
});

app.delete('/api/users/:noteId/notes/:id', (req, res, next) => {
    Note.findByPk(req.params.id)
        .then( note => note.destroy())
        .then(() => res.sendStatus(204))
        .catch(next);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).send({ message: err.message });
});

db.syncAndSeed()
    .then(() =>{
        const port = process.env.PORT || 2000;
        app.listen(port, () => console.log(`listening on port ${port}`));
    });