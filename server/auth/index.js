const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

const db = require('../db/connection');
const users = db.get('users')

function testDBConection() {
	db.then(() => {
		console.log('Connected to mongodb server!')
	}).catch((error) => {
		console.log('Could not connect to mongodb server!')
		console.log(error)
	});
};

users.createIndex('username', {
	unique: true
});

const router = express.Router();

const schema = Joi.object().keys({
	username: Joi.string().alphanum().min(2).max(30).required(),
	password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/).required()
});

router.get('/', (req, res) => {
	res.json({
		message: '🔐'
	});
});

router.post('/signup', (req, res, next) => {
	const result = schema.validate(req.body);
	if (result.error === undefined) {
		users.findOne({
			username: req.body.username
		}).then(user => {
			if (user) {
				const error = new Error('Username is taken')
				next(error)
			} else {
				bcrypt.hash(req.body.password, 12).then(hash => {
					const newUser = {
						username: req.body.username,
						password: hash
					}

					users.insert(newUser).then(insertedUser => {
						res.json(insertedUser);
					});
				});
			}
		});
	} else {
		next(result.error);
	}
});

module.exports = router;