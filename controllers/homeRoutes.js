const router = require('express').Router();
const { Post, User, Comment } = require('../models');
const withAuth = require('../utils/auth');

//route to homepage
router.get('/', async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: { exclude: ['password'] },
        },
      ],
    });

    const posts = postData.map((post) => post.get({ plain: true }));

    res.render('homepage', {
      posts,
      logged_in: req.session.logged_in,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

//route to login page
router.get('/login', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }
  res.render('login');
});

//route to dashboard
router.get('/dashboard', withAuth, async (req, res) => {
  try {
    const postData = await Post.findAll({
      where: {
        user_id: req.session.user_id,
      },
      include: [
        {
          model: Comment,
          include: {
            model: User,
            attributes: ['username'],
          },
        },
        {
          model: User,
          attributes: ['username'],
        },
      ],
    });

    const posts = postData.map((post) => post.get({ plain: true }));

    res.render('dashboard', {
      posts,
      logged_in: true,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

//route to signup page
router.get('/signup', (req, res) => {
  res.render('signup');
});

//route to create post page
router.get('/post', (req, res) => {
  res.render('new-post', { logged_in: req.session.logged_in });
});

//route to edit
router.get('/edit/id:', withAuth, async (req, res) => {
  try {
    const dashboardData = await Post.findByPk(req.params.id, {
      include: [
        {
          model: Comment,
          include: {
            model: User,
            attributes: ['username'],
          },
        },
        {
          model: User,
          attributes: ['username'],
        },
      ],
    });
    if (!dashboardData) {
      res.status(404).json({ message: 'No post found with this id' });
      return;
    }
    const post = dashboardData.get({ plain: true });
    res.render('post', { post, logged_in: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

//route to create new post
router.get('/new', withAuth, async (req, res) => {
  try {
    res.render('new-post', { logged_in: true });
  } catch (error) {
    res.status(500).json(error);
  }
});

//get post by id
router.get('/viewpost/:id', withAuth, async (req, res) => {
  try {
    const postData = await Post.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: User,
          attributes: ['username'],
        },
        {
          model: Comment,
          attributes: ['id', 'content', 'user_id'],
          include: [{ model: User, attributes: ['username'] }],
        },
      ],
    });

    if (!postData) {
      res.status(404).json({ message: 'No post found with this id' });
      return;
    }

    const post = postData.get({ plain: true });

    res.render('comment', {
      post,
      logged_in: req.session.logged_in,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
