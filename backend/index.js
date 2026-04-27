const express = require('express');
const cors = require('cors');
const multer = require('multer');
const PDFDocument = require('pdfkit');

const app = express();
app.use(cors());

// Use memory storage for fast processing without disk I/O
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const crypto = require('crypto');

// Temporary in-memory stores for jobs
// For a production app, use Redis or a Database with a queue.
const jobs = new Map();
const results = new Map();

app.use(express.json()); // For parsing application/json

app.post('/api/upload', upload.array('images'), (req, res) => {
  try {
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }
    
    const jobId = crypto.randomUUID();
    jobs.set(jobId, {
      files: files.map(f => f.buffer)
    });
    
    // Set expiry to prevent memory leaks (10 mins)
    setTimeout(() => jobs.delete(jobId), 10 * 60 * 1000); 
    
    res.json({ jobId, message: 'Upload successful' });
  } catch (err) {
    console.error('Error during upload:', err);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

app.post('/api/convert', async (req, res) => {
  try {
    const { jobId, settings } = req.body;
    
    if (!jobId || !jobs.has(jobId)) {
      return res.status(404).json({ error: 'Job not found or expired' });
    }
    
    const job = jobs.get(jobId);
    
    // Parse settings if available
    let pageSize = 'A4';
    let margin = 0;
    
    if (settings) {
       pageSize = settings.pageSize === 'letter' ? 'LETTER' : 'A4';
       margin = Number(settings.margin) || 0;
    }
    
    // Generate PDF to buffer
    const doc = new PDFDocument({ autoFirstPage: false });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    const pdfPromise = new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
    
    for (const buffer of job.files) {
      doc.addPage({ size: pageSize, margin: margin });
      
      let pWidth = pageSize === 'LETTER' ? 612 : 595.28;
      let pHeight = pageSize === 'LETTER' ? 792 : 841.89;
      
      doc.image(buffer, margin, margin, {
         fit: [pWidth - margin * 2, pHeight - margin * 2],
         align: 'center',
         valign: 'center'
      });
    }
    
    doc.end();
    
    const pdfBuffer = await pdfPromise;
    results.set(jobId, pdfBuffer);
    
    // Free memory
    jobs.delete(jobId);
    setTimeout(() => results.delete(jobId), 10 * 60 * 1000); // 10 minutes expiry
    
    res.json({ message: 'Conversion successful', jobId });
  } catch (err) {
    console.error('Error during conversion:', err);
    res.status(500).json({ error: 'Failed to convert images to PDF' });
  }
});

app.get('/api/download/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  if (!results.has(jobId)) {
    return res.status(404).json({ error: 'PDF not found or expired' });
  }
  
  const pdfBuffer = results.get(jobId);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="converted-${jobId.substring(0, 5)}.pdf"`);
  res.send(pdfBuffer);
  
  // Optional: Cleanup immediately after download, or let the timeout handle it.
  results.delete(jobId);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
