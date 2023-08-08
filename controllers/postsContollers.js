const { validationResult } = require('express-validator');
const HttpError = require('../models/httpError');
const Post = require('../models/postSchema');

const getAllPosts = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid Inputs, Please check again!!', 422));
    }

    let { sortOrder = "asc", sortBy = "createdAt", category = [] } = req.query;

    sortOrder = Number(sortOrder == 'asc' ? 1 : -1);

    let filterQuery = {};
    if (category?.length == 1) {
        filterQuery = {
            category: category
        }
    } else if (category?.length > 1) {
        filterQuery = {
            category: { $all: category }
        }
    }

    // By Default Sort By Created Date
    let sortQuery = {
        createdAt: sortOrder,
        title: sortOrder,
    };
    
    if (sortBy == "title") {
        sortQuery = {
            title: sortOrder,
            createdAt: sortOrder
        }
    }

    try {
        const allPost = await Post.find(filterQuery).sort(sortQuery);
        return res.status(200).json({ posts: allPost })
    } catch (e) {
        return next(new HttpError("Something went wrong! while getting all user's posts", 500));
    }
}

const getPostById = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid Inputs, Please check again!!', 422));
    }

    const id = req.params.id;

    try {
        const userPost = await Post.findById({ _id: id });

        if (!userPost) {
            throw new HttpError("Not Found", 404);
        }

        return res.status(200).json({ post: userPost })
    } catch (e) {
        return next(new HttpError(e.errorMessage || "Something Went Wrong! - while fetching the post by id.", e.code || 500));
    }
}

const createNewPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid Inputs, Please check again!!', 422));
    }

    const { title, description, category } = req.body;
    const createrId = req.userData.userId;

    try {
        const newPost = new Post({
            title,
            description,
            creator: createrId,
            category
        })
        await newPost.save();

        return res.status(200).json({ post: newPost });
    } catch (e) {
        return next(new HttpError("Something Went Wrong! Couldn't create new post.", 500));
    }
}

const updatePostById = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid Inputs, Please check again!!', 422));
    }

    const id = req.params.id;
    const { title, description, category } = req.body;
    const userId = req.userData.userId;

    try {
        const updatedPost = await Post.findOneAndUpdate({
            _id: id,
            creator: userId
        }, {
            title, description, category
        }, { new: true });

        if (!updatedPost) {
            throw new HttpError("Post not found or You are not authorized to edit this post", 400);
        }

        return res.status(200).json({ post: updatedPost });
    } catch (e) {
        return next(new HttpError(e.errorMessage || "Something Went Wrong! while updating the post", e.code || 500));
    }
}

const deletePostById = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid Inputs, Please check again!!', 422));
    }

    const id = req.params.id;
    const creatorId = req.userData.userId;
    try {
        const deletedPost = await Post.findOneAndDelete({
            _id: id,
            creator: creatorId
        });

        if (!deletedPost) {
            throw new HttpError("Post not found or You are not authorized to delete this post", 400);
        }

        return res.status(200).json({ post: deletedPost });
    } catch (e) {
        return next(new HttpError(e.errorMessage || "Something Went Wrong! while deleting the post", e.code || 500));
    }
}

exports.getAllPosts = getAllPosts;
exports.getPostById = getPostById;
exports.createNewPost = createNewPost;
exports.updatePostById = updatePostById;
exports.deletePostById = deletePostById;