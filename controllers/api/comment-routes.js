const router = require('express').Router();
const { Comment, Post } = require('../../models');
const withAuth = require('../../utils/auth');

router.get('/', withAuth, async (req, res) => {
  try {
    const commentData = await Comment.findAll({});
    res.json(commentData);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get('/:id', withAuth, async (req, res) => {
  try {
    const commentData = await Comment.findOne({});
    if (!commentData) {
      res.status(404).json({ message: 'No Comment found with this id' });
      return;
    }
    res.json(commentData);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/', withAuth, async (req, res) => {
  try {
    const commentData = await Comment.create({
      content: req.body.content,
      post_id: req.body.post_id,
      user_id: req.session.user_id,
    });
    if (req.session) {
      res.json(commentData);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put('/:id', withAuth, (req, res) => {
  Comment.update(
    {
      content: req.body.content,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((dbCommentData) => {
      if (!dbCommentData) {
        res.status(404).json({ message: 'No comment found with this id' });
        return;
      }
      res.json(dbCommentData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/:id', withAuth, async (req, res) => {
  try {
    const commentData = await Post.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!commentData) {
      res.status(404).json({ message: 'No Comment found with this id' });
      return;
    }
    res.json(commentData);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
