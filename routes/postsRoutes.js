const express = require('express');
const { getAllPosts, getPostById, createNewPost, updatePostById, deletePostById } = require('../controllers/postsContollers');
const { userPostIdParam, userPostInput } = require('../validators/postsValidators');
const authCheck = require('../middlewares/authCheck');

const router = express.Router();

router.get('/', getAllPosts);
router.get('/:id', userPostIdParam, getPostById);

// Authentication required with routes listed below.
router.use(authCheck);

router.post('/', userPostInput, createNewPost);
router.put('/:id', userPostIdParam, userPostInput, updatePostById);
router.delete('/:id', userPostIdParam, deletePostById);

module.exports = router;