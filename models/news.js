const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: String,      // ✅ Changed from ObjectId to String
        required: true
    },
    image: {
        type: String
    },
    // Link back to the original source article (only populated for
    // NewsAPI-ingested articles — manually created ones via createNews
    // typically won't have one, which is expected).
    url: {
        type: String,
        default: ''
    },
    tags: [
        {
            type: String
        },
    ],
    author: {
        type: String       // ✅ Changed from ObjectId to String
    },
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('New', newsSchema, 'news');