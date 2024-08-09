const express = require('express');
const mongoose = require('mongoose');
const articleRouter = require('./routes/articles');
const Article = require('./models/article');
const methodOverride = require('method-override');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const dbName = 'Blog_website';  
const uri = `mongodb+srv://${username}:${password}@cluster0.n9ynjcx.mongodb.net/${dbName}?retryWrites=true&w=majority`;

// Connect to MongoDB
mongoose.connect(uri)
.then(() => console.log('MongoDB connected'))
.catch((error) => console.error('MongoDB connection error:', error));

// Define the article schema
const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Use Mongoose to check indexes
async function checkIndexes() {
    try {
        const indexes = await Article.collection.indexes();
        console.log('Indexes:', indexes);
    } catch (error) {
        console.error('Error checking indexes:', error);
    }
}

checkIndexes();

// Setup middleware
app.set('views', './pages');
app.set('view engine', 'ejs');

app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('combined')); // Logging for debugging and performance monitoring
app.use(helmet()); // Security headers

// Route to get all articles
app.get('/', async (req, res) => {
    try {
        // Fetch articles with only necessary fields and sort by creation date
        const articles = await Article.find({}, 'title slug createdAt')
            .sort({ createdAt: 'desc' })
            .exec();
        res.render('articles/index', { articles: articles });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Use articleRouter for /articles routes
app.use('/articles', articleRouter);

// Handle errors and invalid routes
app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
