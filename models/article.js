const mongoose = require('mongoose');
const { marked } = require('marked');
const slugify = require('slugify');
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Initialize DOMPurify with a JSDOM window
const dompurify = createDomPurify(new JSDOM().window);

// Define the schema for an article
const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true // Trims whitespace from both ends
    },
    description: {
        type: String,
        trim: true
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    sanitizedHTML: {
        type: String,
        required: true
    }
});

// Pre-save middleware to handle slugification and HTML sanitization
articleSchema.pre('validate', function(next) {
    if (this.title) {
        // Slugify the title to create a URL-friendly string
        this.slug = slugify(this.title, { lower: true, strict: true });
    }

    if (this.markdown) {
        // Sanitize the markdown content and convert it to HTML
        this.sanitizedHTML = dompurify.sanitize(marked(this.markdown));
    }

    next();
});

// Compile the schema into a model and export it
const Article = mongoose.model('Article', articleSchema);
module.exports = Article;
