const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/ebook-platform';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverImage: { url: { type: String, required: true }, publicId: String },
  pdfFile: { publicId: { type: String, required: true }, originalName: String, size: Number },
  category: { type: String, default: 'other' },
  tags: [String],
  language: { type: String, default: 'English' },
  pageCount: { type: Number, default: 0 },
  status: { type: String, default: 'published' },
  ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  salesCount: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  publishedAt: Date,
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

const books = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A classic novel set in the Jazz Age that follows the mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan.",
    price: 0,
    coverImage: { url: "https://covers.openlibrary.org/b/id/8432472-L.jpg", publicId: "great_gatsby" },
    pdfFile: { publicId: "great_gatsby_pdf", originalName: "the-great-gatsby.pdf", size: 1024000 },
    category: "fiction",
    tags: ["classic", "american literature", "jazz age"],
    language: "English",
    pageCount: 180,
    status: "published",
    isFeatured: true,
    ratings: { average: 4.5, count: 1200 },
    publishedAt: new Date(),
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A gripping tale of racial injustice and childhood innocence in the American South, told through the eyes of young Scout Finch.",
    price: 0,
    coverImage: { url: "https://covers.openlibrary.org/b/id/8810494-L.jpg", publicId: "mockingbird" },
    pdfFile: { publicId: "mockingbird_pdf", originalName: "to-kill-a-mockingbird.pdf", size: 1124000 },
    category: "fiction",
    tags: ["classic", "justice", "american south"],
    language: "English",
    pageCount: 281,
    status: "published",
    isFeatured: true,
    ratings: { average: 4.8, count: 2500 },
    publishedAt: new Date(),
  },
  {
    title: "1984",
    author: "George Orwell",
    description: "A dystopian novel about a totalitarian society where Big Brother watches your every move. A chilling vision of the future.",
    price: 0,
    coverImage: { url: "https://covers.openlibrary.org/b/id/8575708-L.jpg", publicId: "1984" },
    pdfFile: { publicId: "1984_pdf", originalName: "1984.pdf", size: 980000 },
    category: "fiction",
    tags: ["dystopia", "political", "classic"],
    language: "English",
    pageCount: 328,
    status: "published",
    isFeatured: true,
    ratings: { average: 4.7, count: 3100 },
    publishedAt: new Date(),
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    description: "Stephen Hawking's landmark volume in science writing explores the universe, black holes, the Big Bang, and the nature of time.",
    price: 9.99,
    coverImage: { url: "https://covers.openlibrary.org/b/id/8739161-L.jpg", publicId: "brief_history" },
    pdfFile: { publicId: "brief_history_pdf", originalName: "a-brief-history-of-time.pdf", size: 1500000 },
    category: "science",
    tags: ["physics", "universe", "cosmology"],
    language: "English",
    pageCount: 212,
    status: "published",
    isFeatured: true,
    ratings: { average: 4.6, count: 1800 },
    publishedAt: new Date(),
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    description: "A sweeping history of humankind from the Stone Age to the modern era, exploring how Homo sapiens came to dominate the world.",
    price: 12.99,
    coverImage: { url: "https://covers.openlibrary.org/b/id/10521270-L.jpg", publicId: "sapiens" },
    pdfFile: { publicId: "sapiens_pdf", originalName: "sapiens.pdf", size: 2000000 },
    category: "history",
    tags: ["history", "humanity", "evolution"],
    language: "English",
    pageCount: 443,
    status: "published",
    isFeatured: true,
    ratings: { average: 4.7, count: 4200 },
    publishedAt: new Date(),
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description: "A magical story about Santiago, a young Andalusian shepherd who travels from Spain to Egypt in search of treasure and his personal legend.",
    price: 7.99,
    coverImage: { url: "https://covers.openlibrary.org/b/id/8234464-L.jpg", publicId: "alchemist" },
    pdfFile: { publicId: "alchemist_pdf", originalName: "the-alchemist.pdf", size: 800000 },
    category: "fiction",
    tags: ["inspirational", "journey", "self-discovery"],
    language: "English",
    pageCount: 197,
    status: "published",
    isFeatured: false,
    ratings: { average: 4.5, count: 5000 },
    publishedAt: new Date(),
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "A proven framework for improving every day. Learn how tiny changes in behavior can lead to remarkable results in your life.",
    price: 14.99,
    coverImage: { url: "https://covers.openlibrary.org/b/id/10515372-L.jpg", publicId: "atomic_habits" },
    pdfFile: { publicId: "atomic_habits_pdf", originalName: "atomic-habits.pdf", size: 1800000 },
    category: "self-help",
    tags: ["habits", "productivity", "self-improvement"],
    language: "English",
    pageCount: 320,
    status: "published",
    isFeatured: true,
    ratings: { average: 4.9, count: 6500 },
    publishedAt: new Date(),
  },
  {
    title: "The Lean Startup",
    author: "Eric Ries",
    description: "How today's entrepreneurs use continuous innovation to create radically successful businesses using lean principles.",
    price: 11.99,
    coverImage: { url: "https://covers.openlibrary.org/b/id/7888796-L.jpg", publicId: "lean_startup" },
    pdfFile: { publicId: "lean_startup_pdf", originalName: "the-lean-startup.pdf", size: 1600000 },
    category: "technology",
    tags: ["startup", "business", "entrepreneurship"],
    language: "English",
    pageCount: 336,
    status: "published",
    isFeatured: false,
    ratings: { average: 4.4, count: 2800 },
    publishedAt: new Date(),
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A romantic novel of manners set in early 19th-century England, following Elizabeth Bennet as she navigates issues of marriage and morality.",
    price: 0,
    coverImage: { url: "https://covers.openlibrary.org/b/id/8739161-L.jpg", publicId: "pride_prejudice" },
    pdfFile: { publicId: "pride_prejudice_pdf", originalName: "pride-and-prejudice.pdf", size: 900000 },
    category: "romance",
    tags: ["classic", "romance", "british literature"],
    language: "English",
    pageCount: 432,
    status: "published",
    isFeatured: false,
    ratings: { average: 4.6, count: 3800 },
    publishedAt: new Date(),
  },
  {
    title: "The Da Vinci Code",
    author: "Dan Brown",
    description: "A murder inside the Louvre and clues in Da Vinci paintings lead to a discovery of a religious mystery that could shake the foundations of Christianity.",
    price: 9.99,
    coverImage: { url: "https://covers.openlibrary.org/b/id/8406786-L.jpg", publicId: "da_vinci_code" },
    pdfFile: { publicId: "da_vinci_code_pdf", originalName: "the-da-vinci-code.pdf", size: 2100000 },
    category: "thriller",
    tags: ["mystery", "thriller", "religion"],
    language: "English",
    pageCount: 689,
    status: "published",
    isFeatured: false,
    ratings: { average: 4.3, count: 7200 },
    publishedAt: new Date(),
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description: "The first book in the beloved Harry Potter series. A young boy discovers he is a wizard and begins his journey at Hogwarts School of Witchcraft and Wizardry.",
    price: 9.99,
    coverImage: { url: "https://covers.openlibrary.org/b/id/10110415-L.jpg", publicId: "harry_potter_1" },
    pdfFile: { publicId: "harry_potter_1_pdf", originalName: "harry-potter-1.pdf", size: 1700000 },
    category: "fantasy",
    tags: ["fantasy", "magic", "wizards", "children"],
    language: "English",
    pageCount: 309,
    status: "published",
    isFeatured: true,
    ratings: { average: 4.9, count: 12000 },
    publishedAt: new Date(),
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description: "Bilbo Baggins, a hobbit who enjoys a comfortable life, is swept into an epic quest to reclaim the lost Dwarf Kingdom of Erebor.",
    price: 8.99,
    coverImage: { url: "https://covers.openlibrary.org/b/id/8406786-L.jpg", publicId: "the_hobbit" },
    pdfFile: { publicId: "the_hobbit_pdf", originalName: "the-hobbit.pdf", size: 1400000 },
    category: "fantasy",
    tags: ["fantasy", "adventure", "classic"],
    language: "English",
    pageCount: 310,
    status: "published",
    isFeatured: false,
    ratings: { average: 4.8, count: 8900 },
    publishedAt: new Date(),
  },
];

async function seedBooks() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find any existing user to use as publisher
    const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }, { strict: false }));
    let publisher = await User.findOne({});

    if (!publisher) {
      // Create a dummy publisher if no user exists
      publisher = await User.create({
        email: 'admin@readsphere.com',
        role: 'publisher',
        name: 'ReadSphere Admin',
        password: 'hashed_password',
      });
      console.log('✅ Created dummy publisher');
    }

    console.log(`📚 Using publisher: ${publisher._id}`);

    // Add publisher ID to all books
    const booksWithPublisher = books.map(book => ({
      ...book,
      publisher: publisher._id,
    }));

    // Insert books
    const inserted = await Book.insertMany(booksWithPublisher);
    console.log(`✅ Successfully added ${inserted.length} books to the database!`);
    
    inserted.forEach(book => {
      console.log(`   📖 ${book.title} by ${book.author}`);
    });

    await mongoose.disconnect();
    console.log('✅ Done! Go to http://localhost:5173 and check Browse Books.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedBooks();
