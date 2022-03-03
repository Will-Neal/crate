const { Request, User, Sale } = require('../models/');
const router = require('express').Router();

router.get('/', async (req, res) => {
      // Send the rendered Handlebars.js template back as the response
  const salesObj = await Sale.findAll({});
  const sales = salesObj.map((sale) => sale.get({ plain:true }));

  res.render('find', {sales});
})

router.get('/new', (req, res) => {
    res.render('find-new')
})

module.exports = router