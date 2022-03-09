const { Request, User, Sale } = require('../models/');
const { restore } = require('../models/User');
const router = require('express').Router();

// GET

// localhost:3001/user/login
router.get('/login', (req, res) => {
    const loggedIn = req.session.loggedIn;
    res.render('login', {loggedIn})
})

// localhost:3001/user/register
router.get('/register', (req, res) => {
    const loggedIn = req.session.loggedIn;
    res.render('register', {loggedIn})
})

router.get('/profile/:id', async (req, res) => {
    id = req.params.id
    const salesObj = await Sale.findAll({
        where: {user_id: id},
        order: [["id", "DESC"]],
        include: [{ model: User}]
    }); 
    const sales = salesObj.map((sale) => sale.get({ plain:true }));

    const requestObj = await Request.findAll({
        where: {user_id: id},
        order: [["id", "DESC"]],
        include: [{ model: User }]
    });
    const seeks = requestObj.map((request) => request.get({ plain:true }));
    username = sales[0].user.name;
    // console.log(requests)

    res.render('profile', {sales, seeks, username})
})

//register new user in db
router.post('/register', async (req, res) => {
    //console.log(req.session)
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });

        req.session.save(() => {
            req.session.userId = newUser.id;
            req.session.username = newUser.name;
            req.session.loggedIn = true;

            //res.json(newUser);
            res.redirect('/');
        });
    } catch (err) {
        //res.status(500).json(err);
        res.redirect('/404');
    }
});

//POST form for login auth
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                email: req.body.email
            },
        });
        
        if (!user) {
            //res.status(400).json({ message: 'You aint got no account!' });
            res.redirect('/404');
            return;
        } 

        const validPassword = user.checkPassword(req.body.password);

        if (!validPassword) {
            //res.status(400).json({ message: 'Incorrect password' });
            res.redirect('/404');
            return;
        }

        req.session.save(() => {
            req.session.userId = user.id;
            req.session.username = user.name;
            req.session.loggedIn = true;

            //res.json({ user, message: 'Logged In!' });
            res.redirect('/');
        });
    } catch (err) {
        //res.status(400).json({ message: 'No user found' });
        res.redirect('/404');
    }
});

//logout
router.post('/logout', (req, res) => {
    //console.log('hit post route');
    //console.log(req.session);
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            //res.status(204).json({ message: 'Logged out' }).end();
            console.log(req.session);
            res.redirect('/');
        });
    } else {
        //res.status(404).end()
        res.redirect('/404');
    };
});

module.exports = router