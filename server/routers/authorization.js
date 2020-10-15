module.exports = router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const User = require('../models/user')
const dotenv = require('dotenv').config({ path: '../.env' })


// /registration
router.route('/registration')
  .post([
    check('email', 'Некорректный email').normalizeEmail().isEmail(),
    check('password', 'Минимальная длина пароля 6 символов').isLength({ min: 6 })
  ], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), message: 'Некорректные данные при регистрации' })
    }
    try {
      const { name, email, password } = req.body
      const candidate = await User.findOne({ email })
      if (candidate) {
        return res.status(400).json({ message: 'Пользователь с таким email уже зарегистрирован' })
      }
      const hashPassword = await bcrypt.hash(password, 15)
      const user = await new User({ name, email, password: hashPassword })
      await user.save()
      res.status(201).json({ message: 'Пользователь создан успешно' })
    } catch (e) {
      res.status(500).json({ message: 'Что то пошло не так на сервере' })
    }
  })

// /login
router.route('/login')
  .post([
    check('email', 'Некотрректный email').normalizeEmail().isEmail(),
    check('password', 'Введите пароль').exists()
  ], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array(), message: 'Некорректные данные при входе в систему' })
    }
    try {
      const { email, password } = req.body
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: 'Пользователь с таким email еще не зарегистрирован' })
      }
      const isMatchPassword = await bcrypt.compare(password, user.password)
      if (!isMatchPassword) {
        return res.status(400).json({ message: 'Пароль введен некорректно' })
      }
      const token = jwt.sign(
        { userEmail: user.email },
        process.env.SECRET_KEY_FOR_JWT_TOKEN,
        { expiresIn: '1h' }
      )
      res.json({ token, user })
    } catch (e) {
      res.status(500).json({ message: 'Что то пошло не так на сервере' })
    }
  })