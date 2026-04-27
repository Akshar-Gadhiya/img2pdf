const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const { PDFDocument, PageSizes, rgb } = require('pdf-lib');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Use memory storage for fast processing without disk I/O
// Max 100 images per upload, size limit managed in frontend
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Temporary in-memory stores for jobs
// For a production app, use Redis or a Database with a queue.
const jobs = new Map();
const results = new Map();

app.post('/api/upload', upload.array('images', 100), async (req, res) => {
  try {
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }
    
    const processedFiles = [];
    
    // Process images in batches to prevent memory overload
    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchPromises = batch.map(async (f) => {
        // Sharp is blazing fast and uses underlying libvips
        return await sharp(f.buffer)
          .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 }) // Normalize all formats to JPEG for faster pdf-lib embedding
          .toBuffer();
      });
      const batchResults = await Promise.all(batchPromises);
      processedFiles.push(...batchResults);
    }
    
    const jobId = crypto.randomUUID();
    jobs.set(jobId, {
      files: processedFiles
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
    
    // Create new PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    
    // Parse settings if available
    let pageSize = PageSizes.A4;
    let margin = 0;
    
    if (settings) {
       // Convert string size to actual dimensions
       pageSize = settings.pageSize === 'letter' ? PageSizes.Letter : PageSizes.A4;
       
       // Handle orientation logic
       if (settings.orientation === 'landscape') {
         pageSize = [pageSize[1], pageSize[0]];
       }
       
       margin = Number(settings.margin) || 0;
    }
    
    // Process each image
    for (const buffer of job.files) {
      // Since we normalized everything to JPEG in the upload step via sharp, we strictly use embedJpg
      const image = await pdfDoc.embedJpg(buffer);
      const page = pdfDoc.addPage(pageSize);
      
      const { width: pageW, height: pageH } = page.getSize();
      const imgDims = image.scale(1);
      
      const availableW = pageW - margin * 2;
      const availableH = pageH - margin * 2;
      
      let finalW = availableW;
      let finalH = availableH;
      
      if (settings && settings.imageFit === 'stretch') {
         // finalW and finalH remain equal to available space
      } else if (settings && settings.imageFit === 'fill') {
         const scale = Math.max(availableW / imgDims.width, availableH / imgDims.height);
         finalW = imgDims.width * scale;
         finalH = imgDims.height * scale;
      } else { 
         // 'fit' is the default
         const scale = Math.min(availableW / imgDims.width, availableH / imgDims.height);
         finalW = imgDims.width * scale;
         finalH = imgDims.height * scale;
      }
      
      // Center the image
      const x = margin + (availableW - finalW) / 2;
      const y = margin + (availableH - finalH) / 2;
      
      page.drawImage(image, {
        x,
        y,
        width: finalW,
        height: finalH,
      });
      
      // If imageFit is 'fill', the image might spill over the available area.
      // We enforce the margin by drawing white rectangles over the edges.
      if (margin > 0) {
        page.drawRectangle({
          x: 0,
          y: pageH - margin,
          width: pageW,
          height: margin,
          color: rgb(1, 1, 1),
        });
        page.drawRectangle({
          x: 0,
          y: 0,
          width: pageW,
          height: margin,
          color: rgb(1, 1, 1),
        });
        page.drawRectangle({
          x: 0,
          y: 0,
          width: margin,
          height: pageH,
          color: rgb(1, 1, 1),
        });
        page.drawRectangle({
          x: pageW - margin,
          y: 0,
          width: margin,
          height: pageH,
          color: rgb(1, 1, 1),
        });
      }
    }
    
    // Serialize PDF Document to bytes
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    
    results.set(jobId, pdfBuffer);
    
    // Free memory from raw files
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
  
  // Clean up immediately after successful download
  results.delete(jobId);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
