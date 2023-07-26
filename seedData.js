const mongoose = require('mongoose');
const Blog = require('./index.js'); 

mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('Error:', err));

const sampleBlogs = [
  {
    name: 'Blog1',
    content: 'content of Blog 1.',
    author: 'Jaimit',
    views: 100,
    likes: 50,
  },
  {
    name: 'Blog2',
    content: 'content of Blog 2.',
    author: 'Jaimit2',
    views: 80,
    likes: 70,
  },
  // Add more sample blogs as needed
];

async function seedData() {
  try {
    // Remove existing blogs data
    await Blog.deleteMany({});

    // Insert sample blogs data
    await Blog.insertMany(sampleBlogs);

    console.log('Sample data inserted');

    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error: ', error);
  }
}

seedData();
