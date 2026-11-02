import express from 'express';
const app = express();
app.use(express.json());

let books = [];
app.get('/', (req, res) => {
    res.send('Library Management System API');
});
const PORT = 3000;

app.post('/api/books', (req, res) => {
    const { id, title, author, category, quantity } = req.body;
    if (!id ||
    typeof title !=='string' || !title.trim() ||
    typeof author !=='string' || !author.trim() ||
    typeof category !=='string' || !category.trim() ||
    quantity===undefined) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }
    if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
        message: "Invalid book ID"
    });
}
    const existingBook = books.find(book => book.id === id);
    if (existingBook) {
        return res.status(409).json({
            message: "Book already exists"
        });
    }
    const newBook = {
        id,
        title,
        author,
        category,
        quantity,
        available: quantity
    };
    books.push(newBook);
    res.status(201).json({
        message: "Book added successfully",
        book: newBook
    });
});
app.get('/api/books', (req, res) => {
    if (books.length === 0) {
        return res.status(200).json({
            message: "No books available",
            books: []
        });
    }
    res.status(200).json({
        message: "Books retrieved successfully",
        books: books
    });
});

app.get('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(book => book.id === id);
    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }
    res.status(200).json({
        message: "Book retrieved successfully",
        book: book
    });
});

app.put('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(book => book.id === id);
    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }
    const { title, author, category, quantity } = req.body;
    if (req.body.id !== undefined && Number(req.body.id) !== id) {
        return res.status(400).json({
            message: "Book ID cannot be changed"
        });
    }
    if (
        (title !== undefined && (typeof title !== 'string' || !title.trim())) ||
        (author !== undefined && (typeof author !== 'string' || !author.trim())) ||
        (category !== undefined && (typeof category !== 'string' || !category.trim())) ||
        (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 0))
    ) {
        return res.status(400).json({
            message: "Invalid book details"
        });
    }
    if (quantity !== undefined) {
        const issuedCopies = book.quantity - book.available;
        if (quantity < issuedCopies) {
            return res.status(400).json({
                message: "Quantity cannot be less than issued copies"
            });
        }
        book.available = quantity - issuedCopies;
        book.quantity = quantity;
    }
    if (title !== undefined) book.title = title.trim();
    if (author !== undefined) book.author = author.trim();
    if (category !== undefined) book.category = category.trim();
    res.status(200).json({
        message: "Book updated successfully",
        book: book
    });
});

app.delete('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(b => b.id === id);
    if (!Number.isInteger(id) || id <= 0)
        return res.status(400).json({ message: 'Invalid book ID' });
    if (index === -1)
        return res.status(404).json({ message: 'Book not found' });
    if (books[index].available < books[index].quantity)
        return res.status(400).json({ message: 'Cannot delete book' });
    const deleted = books.splice(index, 1);
    res.status(200).json({
        message: 'Book deleted successfully',
        book: deleted[0]
    });
});

app.get('/api/books/search', (req, res) => {
    const title = req.query.title;
    if (!title || !title.trim())
        return res.status(400).json({ message: 'Search title required' });
    const result = books.filter(b =>
        b.title.toLowerCase().includes(title.trim().toLowerCase())
    );
    if (result.length === 0)
        return res.status(404).json({ message: 'No books found' });
    res.status(200).json({
        message: 'Books found',
        books: result
    });
});

app.post('/api/books/:id/issue', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);
    if (!Number.isInteger(id) || id <= 0)
        return res.status(400).json({ message: 'Invalid book ID' });
    if (!book)
        return res.status(404).json({ message: 'Book not found' });
    if (book.available <= 0)
        return res.status(400).json({ message: 'No copies available' });
    book.available--;
    res.status(200).json({
        message: 'Book issued successfully',
        book
    });
});

app.post('/api/books/:id/return', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);
    if (!Number.isInteger(id) || id <= 0)
        return res.status(400).json({ message: 'Invalid book ID' });
    if (!book)
        return res.status(404).json({ message: 'Book not found' });
    if (book.available >= book.quantity)
        return res.status(400).json({ message: 'No issued copies to return' });
    book.available++;
    res.status(200).json({
        message: 'Book returned successfully',
        book
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});