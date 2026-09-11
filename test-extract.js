const fs = require('fs');
const path = require('path');
const pdfParsePackage = require('pdf-parse');

const filePath = path.join(__dirname, 'backend/uploads/1788688148619.pdf'); // using an already uploaded file for test

async function extractPdfText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  
  if (pdfParsePackage.PDFParse) {
    // pdf-parse v2 API
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new pdfParsePackage.PDFParse(uint8Array);
    await parser.load();
    const textResult = await parser.getText();
    return typeof textResult === 'string' ? textResult : (textResult.text || '');
  } else if (typeof pdfParsePackage === 'function') {
    // pdf-parse v1 API
    const data = await pdfParsePackage(dataBuffer);
    return data.text || '';
  } else {
    throw new Error('Unsupported pdf-parse library format');
  }
}

extractPdfText(filePath)
  .then(text => console.log('Success, length:', text.length))
  .catch(err => console.error('Failed:', err));
