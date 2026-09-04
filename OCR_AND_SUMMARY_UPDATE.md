# OCR & Document Summary Update

## What changed
- JPG/JPEG/PNG/WEBP uploads now use real Tesseract.js OCR instead of the old sample-text fallback.
- Scanned/image-only PDF pages with little/no selectable text are rendered with PDF.js and passed through OCR.
- OCR preprocessing scales smaller images and converts them to grayscale/contrast-enhanced PNG for better printed-text recognition.
- OCR confidence is surfaced in the document's Important Findings when available.
- Summaries are evidence-based: they only describe information detected in the uploaded text and never infer a diagnosis from a medicine name.
- The document viewer now provides a collapsible detected-text preview so the user can verify OCR results against the original document.
- File size is limited to 15 MB and unsupported file types are rejected with a clear message.

## Setup
Run `npm install` in the frontend project so the `tesseract.js` dependency is installed. The first OCR run downloads/initializes the English Tesseract language data in the browser and can take longer than later runs.

For best results, use clear, well-lit, straight photographs/scans with printed text. Handwriting can still be difficult for any OCR engine and should be verified against the original document.
