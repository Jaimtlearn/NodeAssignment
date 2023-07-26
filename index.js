const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;


mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.error('Error: ', err));


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


app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON payload' });
  } else {
    next();
  }
});


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


app.post('/blogs/:blogId/rank', async (req, res) => {
  const { blogId } = req.params;
  const { rank } = req.body;

  try {
    
    if (!rank || rank < 1 || rank > 100) {
      return res.status(400).json({ error: 'Invalid rank value. Rank should be between 1 and 100.' });
    }

    
    const blog = await Blog.findById(blogId).exec();

    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    
    let ranking = await Ranking.findOne({ blog_id: blogId }).exec();

    
    if (!ranking) {
      ranking = new Ranking({ blog_id: blogId });
    }

    
    ranking.rank = rank;
    await ranking.save();

    res.json({ message: 'Rank updated successfully', rank: ranking.rank });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
