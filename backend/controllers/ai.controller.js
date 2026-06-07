const PDFParser = require('pdf2json');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Extract text from PDF
const extractTextFromPDF = (buffer) => {
  return new Promise((resolve) => {
    try {
      const pdfParser = new PDFParser();
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          const text = pdfData.Pages.map(page =>
            page.Texts.map(t => decodeURIComponent(t.R[0].T)).join(' ')
          ).join('\n');
          resolve(text.trim());
        } catch (e) {
          resolve('');
        }
      });
      pdfParser.on('pdfParser_dataError', () => resolve(''));
      pdfParser.parseBuffer(buffer);
    } catch (e) {
      resolve('');
    }
  });
};

// Generate AI Summary from PDF
const generateSummary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const text = await extractTextFromPDF(req.file.buffer);

    if (!text || text.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'This appears to be a scanned PDF. Please upload a text-based PDF where you can select and copy text.',
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `You are a helpful assistant. Read the following text and provide:
1. SHORT SUMMARY (2-3 sentences)
2. DETAILED SUMMARY (1-2 paragraphs)
3. KEY POINTS (5 bullet points)

Text: ${text.slice(0, 10000)}`,
        }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const summary = completion.choices[0].message.content;
    res.json({ success: true, summary });
  } catch (err) {
    console.error('AI Summary Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Extract text from PDF
const extractPDFText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const text = await extractTextFromPDF(req.file.buffer);

    if (!text || text.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'This appears to be a scanned PDF. Please upload a text-based PDF.',
      });
    }

    res.json({ success: true, text });
  } catch (err) {
    console.error('Extract Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Chat with PDF
const chatWithPDF = async (req, res) => {
  try {
    const { question, pdfText } = req.body;

    if (!question || !pdfText) {
      return res.status(400).json({ success: false, message: 'Question and PDF text are required' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `You are a helpful assistant. Based on the following document text, answer the user's question clearly and concisely.

Document: ${pdfText.slice(0, 10000)}

Question: ${question}`,
        }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const answer = completion.choices[0].message.content;
    res.json({ success: true, answer });
  } catch (err) {
    console.error('Chat Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { generateSummary, chatWithPDF, extractPDFText };
        