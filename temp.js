const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

const blogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
});

const rankingSchema = new mongoose.Schema({
  blog_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  rank: { type: Number, required: true, min: 1, max: 100 },
});

const Blog = mongoose.model('Blog', blogSchema);
const Ranking = mongoose.model('Ranking', rankingSchema);

app.use(express.json());

app.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().exec();
    const rankedBlogs = await Promise.all(
      blogs.map(async (blog) => {
        const rankData = await Ranking.findOne({ blog_id: blog._id }).exec();
        return { ...blog.toObject(), rank: rankData ? rankData.rank : null };
      })
    );

    rankedBlogs.sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));

    res.json({ totalBlogs: rankedBlogs.length, blogs: rankedBlogs });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, async () => {
  try {
    await Blog.deleteMany({}); 
    const predefinedBlogs = [
      {
        name: 'Blog1',
        content: 'content of Blog 1.',
        author: 'Jaimit',
        views: 100,
        likes: 50,
      },
      {
        name: 'Blog2',
        content: 'This is the content of Blog 2.',
        author: 'Jaimit2',
        views: 80,
        likes: 70,
      },
      
    ];
    await Blog.insertMany(predefinedBlogs);

    console.log('Predefined data inserted');
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Error: ', error);
  }
});
