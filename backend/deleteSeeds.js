const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/ebook-platform').then(async () => {
  const result = await mongoose.connection.collection('books').deleteMany({
    'pdfFile.publicId': { $not: new RegExp('^ebook-platform') }
  });
  console.log(`✅ Deleted ${result.deletedCount} seeded books!`);
  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
