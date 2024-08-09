const express = require('express');
const router = express.Router();
const Article = require('../models/article');

// Render the form for creating a new article
router.get('/new', (req, res) => {
    res.render('articles/new', { article: new Article() });
});

// Render the form for editing an existing article
router.get('/edit/:id', async (req, res) => {
    const article = await Article.findById(req.params.id).catch(() => null);
    if (!article) return res.redirect('/');
    res.render('articles/edit', { article });
});

// Handle the creation of a new article
router.post('/', initializeArticle, saveArticle('new'));

// Handle the update of an existing article
router.put('/:id', findArticleById, saveArticle('edit'));

// Display an article by its slug
router.get('/:slug', async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug }).catch(() => null);
    if (!article) return res.redirect('/');
    res.render('articles/show', { article });
});

// Route to delete an article
router.delete('/:id', async (req, res) => {
    try {
        // Use the provided ID to find and delete the document
        await Article.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Middleware to initialize a new article
function initializeArticle(req, res, next) {
    req.article = new Article();
    next();
}

// Middleware to find an article by ID
async function findArticleById(req, res, next) {
    req.article = await Article.findById(req.params.id).catch(() => null);
    if (!req.article) return res.redirect('/');
    next();
}

// Function to handle saving articles
function saveArticle(path) {
    return async (req, res) => {
        const { article } = req;
        Object.assign(article, {
            title: req.body.title,
            description: req.body.description,
            markdown: req.body.markdown,
        });

        try {
            await article.save();
            res.redirect(`/articles/${article.slug}`);
        } catch (error) {
            res.render(`articles/${path}`, { article, error: error.message });
        }
    };
}

module.exports = router;
