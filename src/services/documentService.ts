import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { MedicalDocument, DetectedMedicine } from '../types';
import { api } from './api';

// Configure the worker from the exact same pdfjs-dist package version used by the API.
// This prevents API/Worker version mismatches (for example 6.3.x vs 4.10.x).
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
}

// Known educational medicine purposes (Educational only - NEVER treated as a diagnosis)
const EDUCATIONAL_MEDICINE_GUIDE: { [key: string]: string } = {
  'paracetamol': 'Commonly used to relieve mild-to-moderate pain and reduce elevated body temperature as directed by a physician.',
  'crocin': 'Analgesic and antipyretic formulation used for pain and temperature regulation.',
  'dolo': 'Analgesic medicine commonly advised for body aches and discomfort.',
  'amoxicillin': 'Antibacterial medication prescribed for bacterial infections as determined by a licensed doctor.',
  'azithromycin': 'Macrolide antibiotic prescribed for specific bacterial respiratory or soft tissue infections.',
  'cetirizine': 'Antihistamine medication used to manage allergic symptoms such as sneezing, itching, or watery eyes.',
  'pantoprazole': 'Proton pump inhibitor used to reduce stomach acid production and soothe gastric irritation.',
  'omeprazole': 'Gastric acid reducer commonly prescribed to protect the stomach lining.',
  'metformin': 'Oral agent prescribed to assist in metabolic glucose regulation as directed by an endocrinologist.',
  'amlodipine': 'Calcium channel blocker prescribed to assist in cardiovascular pressure regulation.',
  'telmisartan': 'Angiotensin receptor blocker used to maintain balanced arterial pressure.',
  'atorvastatin': 'Lipid-lowering medication used to assist in maintaining healthy cholesterol levels.',
  'montelukast': 'Leukotriene receptor antagonist used to support respiratory airway stability.',
  'ibuprofen': 'Non-steroidal anti-inflammatory medication (NSAID) used to alleviate inflammation and discomfort.',
  'calcium': 'Nutritional mineral supplement supporting bone and skeletal density.',
  'vitamin d3': 'Essential fat-soluble vitamin aiding calcium absorption and bone mineralization.'
};

export type AnalysisStage =
  | 'idle'
  | 'reading'
  | 'analyzing'
  | 'preparing'
  | 'completed'
  | 'error';

export interface DocumentAnalysisResult {
  document: MedicalDocument;
  extractedText: string;
}

interface TextExtractionResult {
  text: string;
  confidence: number | null;
  usedOcr: boolean;
}

class DocumentService {
  /**
   * Reads and analyzes all pages of a PDF or complete image file.
   * Progresses through: reading -> analyzing -> preparing -> completed.
   */
  async processDocument(
    file: File,
    userId: string,
    onStageChange?: (
      stage: AnalysisStage,
      progressPercent: number
    ) => void
  ): Promise<DocumentAnalysisResult> {
    try {
      onStageChange?.('reading', 10);

      if (file.size > 15 * 1024 * 1024) {
        throw new Error(
          'File is too large. Please upload a document smaller than 15 MB.'
        );
      }

      const isPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');

      const isImage =
        ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(
          file.type
        ) || /\.(png|jpe?g|webp)$/i.test(file.name);

      if (!isPdf && !isImage) {
        throw new Error(
          'Unsupported file type. Please upload a PDF, JPG, JPEG, PNG, or WEBP file.'
        );
      }

      let extractedText = '';
      let pageCount = 1;
      let extractionConfidence: number | null = null;
      let usedOcr = false;

      if (isPdf) {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        pageCount = pdf.numPages;

        const textPages: string[] = [];
        const sparsePages: {
          pageNumber: number;
          canvas: HTMLCanvasElement;
        }[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          const pageText = textContent.items
            .map((item: any) =>
              typeof item?.str === 'string' ? item.str.trim() : ''
            )
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          textPages.push(`--- Page ${i} ---\n${pageText}`);

          // Scanned/image-only pages normally have no selectable text.
          // Render only sparse pages so hybrid PDFs do not pay the OCR cost unnecessarily.
          if (pageText.length < 20) {
            const viewport = page.getViewport({ scale: 2.0 });

            const canvas = document.createElement('canvas');

            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);

            const context = canvas.getContext('2d', {
              alpha: false
            });

            if (context) {
              context.fillStyle = '#ffffff';
              context.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
              );

              await page.render({
                canvas,
                canvasContext: context,
                viewport
              }).promise;

              sparsePages.push({
                pageNumber: i,
                canvas
              });
            }
          }
        }

        extractedText = textPages.join('\n\n').trim();

        if (sparsePages.length > 0) {
          const ocrResult = await this.ocrPdfPages(
            sparsePages,
            pdf.numPages,
            (pageNumber, totalPages) => {
              const progress =
                20 +
                Math.round((pageNumber / totalPages) * 28);

              onStageChange?.(
                'reading',
                Math.min(progress, 48)
              );
            }
          );

          usedOcr = true;
          extractionConfidence = ocrResult.confidence;

          extractedText = this.mergePdfTextAndOcr(
            textPages,
            ocrResult.pages
          );
        }
      } else {
        const ocrResult = await this.readImageText(
          file,
          (progress) => {
            onStageChange?.(
              'reading',
              15 + Math.round(progress * 0.35)
            );
          }
        );

        extractedText = ocrResult.text;
        extractionConfidence = ocrResult.confidence;
        usedOcr = true;
      }

      if (
        !extractedText ||
        extractedText.replace(/\s+/g, ' ').trim().length < 15
      ) {
        extractedText = `Document: ${file.name}
No readable text was detected. Please upload a clearer, well-lit scan or a text-based PDF.`;
      }

      onStageChange?.('analyzing', 58);

      await new Promise((r) => setTimeout(r, 250));

      onStageChange?.('preparing', 82);

      await new Promise((r) => setTimeout(r, 250));

      const parsedData = this.parseDocumentContent(
        extractedText,
        file.name,
        pageCount
      );

      const qualityNote = this.buildExtractionQualityNote(
        file.name,
        usedOcr,
        extractionConfidence
      );

      if (qualityNote) {
        parsedData.importantFindings.unshift(qualityNote);
      }

      const newDoc: MedicalDocument = {
        id: `doc_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 6)}`,
        userId,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: this.formatFileSize(file.size),
        uploadDate: new Date().toISOString(),
        documentType: parsedData.documentType,
        doctorName: parsedData.doctorName,
        hospitalName: parsedData.hospitalName,
        patientName: parsedData.patientName,
        simpleSummary: parsedData.simpleSummary,
        importantFindings: parsedData.importantFindings,
        medicalTerms: parsedData.medicalTerms,
        medicinesDetected: parsedData.medicinesDetected,
        explicitDiagnosis: parsedData.explicitDiagnosis,
        attentionLevel: parsedData.attentionLevel,
        pageCount,
        rawExtractedText: extractedText
      };

      onStageChange?.('completed', 100);

      return {
        document: newDoc,
        extractedText
      };
    } catch (err: any) {
      onStageChange?.('error', 0);

      throw new Error(
        err?.message ||
        'Failed to process the document. Please try again with a valid file.'
      );
    }
  }

  /** Real OCR for image files using Tesseract.js. No sample/fake medical text is generated. */
  private async readImageText(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<TextExtractionResult> {
    const { createWorker } = await import('tesseract.js');

    const worker = await createWorker('eng', 1, {
      logger: (message: {
        status?: string;
        progress?: number;
      }) => {
        const progress = Math.max(
          0,
          Math.min(1, message?.progress ?? 0)
        );

        onProgress?.(Math.round(progress * 100));
      }
    });

    try {
      const preparedImage = await this.prepareImageForOcr(file);

      const result = await worker.recognize(preparedImage);

      return {
        text: result.data.text?.trim() || '',
        confidence:
          typeof result.data.confidence === 'number'
            ? result.data.confidence
            : null,
        usedOcr: true
      };
    } finally {
      await worker.terminate();
    }
  }

  /**
   * Normalizes a photographed/scanned page before OCR:
   * scales small images up and converts them to grayscale
   * with gentle contrast.
   *
   * This improves printed-text recognition without changing
   * the stored original document.
   */
  private async prepareImageForOcr(file: File): Promise<Blob> {
    const imageUrl = URL.createObjectURL(file);

    try {
      const image = new Image();

      image.decoding = 'async';
      image.src = imageUrl;

      await image.decode();

      const targetWidth = Math.min(
        2400,
        Math.max(image.naturalWidth, 1600)
      );

      const scale =
        image.naturalWidth > 0
          ? targetWidth / image.naturalWidth
          : 1;

      const canvas = document.createElement('canvas');

      canvas.width = Math.max(
        1,
        Math.round(image.naturalWidth * scale)
      );

      canvas.height = Math.max(
        1,
        Math.round(image.naturalHeight * scale)
      );

      const ctx = canvas.getContext('2d', {
        willReadFrequently: true
      });

      if (!ctx) return file;

      ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const pixels = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const data = pixels.data;

      for (let i = 0; i < data.length; i += 4) {
        // Luma conversion keeps printed dark text while removing color noise.
        const gray = Math.round(
          0.299 * data[i] +
          0.587 * data[i + 1] +
          0.114 * data[i + 2]
        );

        const contrasted = Math.max(
          0,
          Math.min(
            255,
            Math.round((gray - 128) * 1.18 + 128)
          )
        );

        data[i] = contrasted;
        data[i + 1] = contrasted;
        data[i + 2] = contrasted;
      }

      ctx.putImageData(pixels, 0, 0);

      const blob = await new Promise<Blob | null>(
        (resolve) =>
          canvas.toBlob(
            resolve,
            'image/png',
            1
          )
      );

      return blob || file;
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  /** OCR sparse/scanned PDF pages. Each page is rendered at 2x before recognition. */
  private async ocrPdfPages(
    pages: {
      pageNumber: number;
      canvas: HTMLCanvasElement;
    }[],
    totalPages: number,
    onPageProgress?: (
      pageNumber: number,
      totalPages: number
    ) => void
  ): Promise<{
    pages: {
      pageNumber: number;
      text: string;
    }[];
    confidence: number | null;
  }> {
    const { createWorker } = await import('tesseract.js');

    const worker = await createWorker('eng', 1);

    const results: {
      pageNumber: number;
      text: string;
    }[] = [];

    const confidences: number[] = [];

    try {
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        const result = await worker.recognize(
          page.canvas
        );

        results.push({
          pageNumber: page.pageNumber,
          text: result.data.text?.trim() || ''
        });

        if (
          typeof result.data.confidence === 'number'
        ) {
          confidences.push(
            result.data.confidence
          );
        }

        onPageProgress?.(
          page.pageNumber,
          totalPages
        );
      }
    } finally {
      await worker.terminate();
    }

    const confidence = confidences.length
      ? Math.round(
        confidences.reduce(
          (sum, value) => sum + value,
          0
        ) / confidences.length
      )
      : null;

    return {
      pages: results,
      confidence
    };
  }

  private mergePdfTextAndOcr(
    textPages: string[],
    ocrPages: {
      pageNumber: number;
      text: string;
    }[]
  ): string {
    const ocrByPage = new Map(
      ocrPages.map((page) => [
        page.pageNumber,
        page.text
      ])
    );

    return textPages
      .map((pageText, index) => {
        const pageNumber = index + 1;

        const selectableText = pageText
          .replace(
            /^--- Page \d+ ---\s*/i,
            ''
          )
          .trim();

        const ocrText =
          ocrByPage.get(pageNumber)?.trim() || '';

        if (selectableText.length >= 20) {
          return pageText;
        }

        return `--- Page ${pageNumber} ---
${ocrText || selectableText}`;
      })
      .join('\n\n')
      .trim();
  }

  private buildExtractionQualityNote(
    fileName: string,
    usedOcr: boolean,
    confidence: number | null
  ): string | null {
    if (!usedOcr) return null;

    if (
      confidence !== null &&
      confidence < 45
    ) {
      return `OCR quality for "${fileName}" is low (${confidence}% confidence). Review the extracted details against the original document before relying on them.`;
    }

    if (confidence !== null) {
      return `OCR completed for "${fileName}" with approximately ${confidence}% recognition confidence. Extracted details are based only on detected text.`;
    }

    return `OCR completed for "${fileName}". Extracted details are based only on detected text.`;
  }

  /**
   * STRICT ACCURACY PARSER:
   * Extracts ONLY what is actually in the text.
   * NEVER invents diseases (e.g. Paracetamol -> NEVER invent "Fever" unless explicitly written!).
   */
  private parseDocumentContent(
    text: string,
    fileName: string,
    pageCount: number
  ) {
    const lower = text.toLowerCase();

    // 1. Detect Document Type
    let documentType = 'Prescription';

    if (
      lower.includes('lab') ||
      lower.includes('test report') ||
      lower.includes('pathology') ||
      lower.includes('blood test') ||
      lower.includes('hemoglobin')
    ) {
      documentType = 'Lab Report';
    } else if (
      lower.includes('discharge') ||
      lower.includes('summary of hospitalization')
    ) {
      documentType = 'Discharge Summary';
    } else if (
      lower.includes('radiology') ||
      lower.includes('x-ray') ||
      lower.includes('mri') ||
      lower.includes('ultrasound') ||
      lower.includes('ct scan')
    ) {
      documentType = 'Radiology / Scan Report';
    } else if (
      lower.includes('bill') ||
      lower.includes('invoice') ||
      lower.includes('receipt')
    ) {
      documentType = 'Medical Bill';
    }

    // 2. Extract Doctor Name if present
    let doctorName: string | undefined;

    const docMatch = text.match(
      /(?:Dr\.?|Doctor)\s+([A-Za-z\s.]+?)(?=\n|,|\(|\-|\bMS\b|\bMD\b|\bMBBS\b|$)/i
    );

    if (
      docMatch &&
      docMatch[1]?.trim().length > 2
    ) {
      doctorName = `Dr. ${docMatch[1].trim()}`;
    }

    // 3. Extract Hospital/Clinic Name if present
    let hospitalName: string | undefined;

    const hospMatch = text.match(
      /([A-Za-z\s]+(?:Hospital|Clinic|Healthcare|Institute|Care Center|Medical Center))/i
    );

    if (
      hospMatch &&
      hospMatch[1]?.trim().length > 3
    ) {
      hospitalName = hospMatch[1].trim();
    }

    // 4. Extract Patient Name if present
    let patientName: string | undefined;

    const patMatch = text.match(
      /(?:Patient(?:\s+Name)?|Name|Pt\.?)\s*:\s*([A-Za-z\s.]+?)(?=\n|,|\(|\-|\bAge\b|\bGender\b|$)/i
    );

    if (
      patMatch &&
      patMatch[1]?.trim().length > 2
    ) {
      patientName = patMatch[1].trim();
    }

    // 5. Explicit Diagnosis Extraction
    // CRITICAL: Only if explicitly written!
    let explicitDiagnosis: string | undefined;

    const diagMatch = text.match(
      /(?:Diagnosis|Impression|Assessment|Condition|Clinical Impression)\s*:\s*([^\n\r.]+)/i
    );

    if (
      diagMatch &&
      diagMatch[1]?.trim().length > 2
    ) {
      explicitDiagnosis = diagMatch[1].trim();
    } else {
      explicitDiagnosis =
        'No specific diagnosis or condition was clearly identified in the uploaded prescription.';
    }

    // 6. Detect Medicines strictly from text
    const medicinesDetected: DetectedMedicine[] = [];

    const medicineRegexes = [
      /(?:Rx|Tab\.?|Cap\.?|Syp\.?|Inj\.?|Tablet|Capsule|Syrup)?\s*([A-Za-z+ -]{3,30})\s+(\d+\s*(?:mg|gm|ml|mcg|IU|%))(?:\s*-\s*|\s+)?([^\n\r]+)?/gi,

      /(\b(?:Paracetamol|Crocin|Dolo|Amoxicillin|Azithromycin|Cetirizine|Pantoprazole|Omeprazole|Metformin|Amlodipine|Telmisartan|Atorvastatin|Montelukast|Ibuprofen|Calcium|Vitamin D3|Ciprofloxacin|Augmentin|Levocetirizine|Ranitidine)\b)(?:\s+(\d+\s*(?:mg|gm|ml|mcg|IU)))?(?:\s*[-:]?\s*([^\n\r]+))?/gi
    ];

    const foundNames = new Set<string>();

    for (const regex of medicineRegexes) {
      let match;

      while (
        (match = regex.exec(text)) !== null
      ) {
        const rawName = match[1]?.trim();

        if (
          !rawName ||
          rawName.length < 3 ||
          rawName.toLowerCase().startsWith('page') ||
          rawName.toLowerCase().startsWith('date')
        ) {
          continue;
        }

        const nameKey =
          rawName.toLowerCase();

        if (foundNames.has(nameKey)) {
          continue;
        }

        foundNames.add(nameKey);

        const strength =
          match[2]?.trim() ||
          'Strength as prescribed';

        const restOfLine =
          match[3]?.trim() || '';

        // Extract duration e.g. "5 days", "1 month", "x 10 days"
        let duration =
          'As advised by doctor';

        const durMatch =
          restOfLine.match(
            /(?:x\s*)?(\d+\s*(?:days?|weeks?|months?))/i
          );

        if (durMatch) {
          duration = durMatch[1];
        }

        // Extract instructions e.g. "1 tab twice daily", "after food", "OD", "BD", "TDS", "SOS"
        let instructions =
          restOfLine ||
          'Follow doctor or pharmacist instructions exactly.';

        if (
          instructions.includes('x ') &&
          durMatch
        ) {
          instructions =
            instructions
              .replace(durMatch[0], '')
              .trim() || instructions;
        }

        // Match educational purpose from dictionary
        // Never treating it as diagnosis
        let matchedPurpose =
          'Educational reference: Follow instructions provided by your doctor or pharmacist.';

        for (const [k, purp] of Object.entries(
          EDUCATIONAL_MEDICINE_GUIDE
        )) {
          if (nameKey.includes(k)) {
            matchedPurpose = purp;
            break;
          }
        }

        medicinesDetected.push({
          name: rawName,
          strength,
          instructions,
          duration,
          purpose: matchedPurpose,
          frequency:
            this.detectFrequency(
              instructions
            ),
          route: 'Oral'
        });
      }
    }

    // If no medicines found with regex,
    // do a fallback check for common names in text
    if (medicinesDetected.length === 0) {
      for (const [k, purp] of Object.entries(
        EDUCATIONAL_MEDICINE_GUIDE
      )) {
        if (lower.includes(k)) {
          medicinesDetected.push({
            name:
              k.charAt(0).toUpperCase() +
              k.slice(1),
            strength:
              'As noted in document',
            instructions:
              'Take strictly according to physician prescription',
            duration:
              'Follow prescription',
            purpose: purp,
            frequency:
              'As prescribed',
            route: 'Oral'
          });
        }
      }
    }

    // 7. Important Findings
    // Fact-based only, no invented diseases
    const importantFindings: string[] = [];

    if (pageCount > 1) {
      importantFindings.push(
        `Analyzed all ${pageCount} pages of the complete multi-page document.`
      );
    }

    if (doctorName) {
      importantFindings.push(
        `Consulting Physician identified: ${doctorName}.`
      );
    }

    if (medicinesDetected.length > 0) {
      importantFindings.push(
        `Extracted ${medicinesDetected.length} prescribed medication(s) with dosage and schedule guidance.`
      );
    }

    if (
      explicitDiagnosis &&
      !explicitDiagnosis.includes(
        'No specific diagnosis'
      )
    ) {
      importantFindings.push(
        `Document explicitly notes: "${explicitDiagnosis}".`
      );
    } else {
      importantFindings.push(
        'No confirmed diagnosis is explicitly written in the document.'
      );
    }

    // 8. Medical Terms detected in text
    const medicalTerms: {
      term: string;
      explanation: string;
    }[] = [];

    if (
      lower.includes('analgesic') ||
      lower.includes('pain') ||
      lower.includes('paracetamol')
    ) {
      medicalTerms.push({
        term: 'Analgesic',
        explanation:
          'A medication category formulated specifically to relieve bodily aches and pain.'
      });
    }

    if (
      lower.includes('ortho') ||
      lower.includes('joint') ||
      lower.includes('bone')
    ) {
      medicalTerms.push({
        term: 'Musculoskeletal',
        explanation:
          'Relating to the muscular system and skeletal system including bones, joints, ligaments, and tendons.'
      });
    }

    if (
      lower.includes('sos') ||
      lower.includes('prn')
    ) {
      medicalTerms.push({
        term: 'SOS / PRN',
        explanation:
          'Medical notation meaning "as needed" rather than on a fixed schedule.'
      });
    }

    if (
      lower.includes('od') ||
      lower.includes('once daily')
    ) {
      medicalTerms.push({
        term: 'OD (Omni Die)',
        explanation:
          'Latin medical abbreviation meaning "once daily".'
      });
    }

    if (
      lower.includes('bd') ||
      lower.includes('bid') ||
      lower.includes('twice daily')
    ) {
      medicalTerms.push({
        term: 'BD / BID (Bis in Die)',
        explanation:
          'Medical abbreviation meaning "twice daily".'
      });
    }

    // 9. Attention Level Determination
    let attentionLevel:
      | 'routine'
      | 'discuss'
      | 'prompt' = 'routine';

    if (
      lower.includes('critical') ||
      lower.includes('emergency') ||
      lower.includes('urgent') ||
      lower.includes('severe') ||
      lower.includes('acute')
    ) {
      attentionLevel = 'prompt';
    } else if (
      lower.includes('abnormal') ||
      lower.includes('elevated') ||
      lower.includes('monitor') ||
      lower.includes('follow-up') ||
      lower.includes('review')
    ) {
      attentionLevel = 'discuss';
    }

    // 10. Plain-English, patient-friendly summary.
    // Keep the main summary readable and natural.
    // It should explain what the document contains,
    // without exposing OCR/parser terminology such as
    // "detected text" or "clinical text" and without inventing diagnoses.
    const summaryParts: string[] = [];

    const friendlyType =
      documentType === 'Lab Report'
        ? 'laboratory test report'
        : documentType ===
          'Radiology / Scan Report'
          ? 'scan report'
          : documentType.toLowerCase();

    if (
      lower.includes('complete blood count') ||
      /\bcbc\b/i.test(text)
    ) {
      summaryParts.push(
        'This is a Complete Blood Count (CBC) report. It contains blood-test results such as white blood cell count, haemoglobin, and other blood measurements.'
      );

      const wbcMatch = text.match(
        /WBC\s*Count\s*([0-9]+(?:\.[0-9]+)?)/i
      );

      const wbcRange = text.match(
        /(?:WBC\s*Count|WBC)[^\n]{0,120}?([0-9,]+)\s*[-–]\s*([0-9,]+)/i
      );

      if (wbcMatch) {
        const value = wbcMatch[1];

        const range = wbcRange
          ? `${wbcRange[1]} to ${wbcRange[2]}`
          : null;

        summaryParts.push(
          `The white blood cell count recorded in the report is ${value}${range
            ? `, compared with the report's reference range of ${range}`
            : ''
          }.`
        );
      }

      const hgbMatch = text.match(
        /(?:HGB|HB|Haemoglobin|Hemoglobin)\s*([0-9]+(?:\.[0-9]+)?)/i
      );

      const hgbRange = text.match(
        /(?:HGB|HB|Haemoglobin|Hemoglobin)[^\n]{0,100}?([0-9]+(?:\.[0-9]+)?)\s*[-–]\s*([0-9]+(?:\.[0-9]+)?)/i
      );

      if (hgbMatch) {
        const value = hgbMatch[1];

        const range = hgbRange
          ? `${hgbRange[1]} to ${hgbRange[2]}`
          : null;

        summaryParts.push(
          `The haemoglobin value recorded is ${value}${range
            ? `, with a printed reference range of ${range}`
            : ''
          }.`
        );
      }
    } else {
      summaryParts.push(
        `This is a ${friendlyType} containing information from ${pageCount} page${pageCount === 1 ? '' : 's'
        }.`
      );
    }

    if (doctorName) {
      summaryParts.push(
        `The report lists ${doctorName} as the doctor.`
      );
    }

    if (hospitalName) {
      summaryParts.push(
        `The listed healthcare facility is ${hospitalName}.`
      );
    }

    if (patientName) {
      summaryParts.push(
        `The patient name shown on the document is ${patientName}.`
      );
    }

    if (medicinesDetected.length > 0) {
      const medicineNames =
        medicinesDetected
          .slice(0, 4)
          .map((m) => m.name)
          .join(', ');

      const suffix =
        medicinesDetected.length > 4
          ? ', and other medicines'
          : '';

      summaryParts.push(
        `The document lists ${medicinesDetected.length} medicine${medicinesDetected.length === 1
          ? ''
          : 's'
        }: ${medicineNames}${suffix}.`
      );
    }

    const summaryLines =
      this.extractRelevantLines(text, [
        'advice',
        'recommendation',
        'recommended',
        'follow-up',
        'follow up',
        'impression',
        'conclusion',
        'findings',
        'investigation',
        'result',
        'plan',
        'review',
        'precaution',
        'instruction'
      ]);

    if (summaryLines.length > 0) {
      const cleanClinicalText =
        summaryLines
          .slice(0, 2)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

      if (cleanClinicalText) {
        summaryParts.push(
          `The document also includes these instructions or findings: ${cleanClinicalText}.`
        );
      }
    }

    if (
      explicitDiagnosis &&
      !explicitDiagnosis.includes(
        'No specific diagnosis'
      )
    ) {
      summaryParts.push(
        `The diagnosis written in the document is ${explicitDiagnosis}.`
      );
    } else {
      summaryParts.push(
        'The document does not clearly state a diagnosis.'
      );
    }

    const simpleSummary =
      summaryParts.join(' ');

    return {
      documentType,
      doctorName,
      hospitalName,
      patientName,
      explicitDiagnosis,
      simpleSummary,
      importantFindings,
      medicalTerms,
      medicinesDetected,
      attentionLevel
    };
  }

  private extractRelevantLines(
    text: string,
    keywords: string[]
  ): string[] {
    const lines = text
      .split(/\r?\n/)
      .map((line) =>
        line
          .replace(
            /^[-•*\d.)\s]+/,
            ''
          )
          .trim()
      )
      .filter(
        (line) =>
          line.length >= 8 &&
          line.length <= 240
      );

    const normalizedKeywords =
      keywords.map((keyword) =>
        keyword.toLowerCase()
      );

    const selected: string[] = [];

    for (const line of lines) {
      const lower =
        line.toLowerCase();

      if (
        normalizedKeywords.some(
          (keyword) =>
            lower.includes(keyword)
        ) &&
        !selected.includes(line)
      ) {
        selected.push(line);
      }
    }

    return selected.slice(0, 6);
  }

  private detectFrequency(
    text: string
  ): string {
    const lower =
      text.toLowerCase();

    if (
      lower.includes('sos') ||
      lower.includes('as needed')
    ) {
      return 'As needed (SOS)';
    }

    if (
      lower.includes('tds') ||
      lower.includes('tid') ||
      lower.includes('thrice')
    ) {
      return '3 times daily (TDS)';
    }

    if (
      lower.includes('bd') ||
      lower.includes('bid') ||
      lower.includes('twice')
    ) {
      return '2 times daily (BD)';
    }

    if (
      lower.includes('od') ||
      lower.includes('once daily')
    ) {
      return 'Once daily (OD)';
    }

    return 'As prescribed';
  }

  private formatFileSize(
    bytes: number
  ): string {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;

    const sizes = [
      'Bytes',
      'KB',
      'MB',
      'GB'
    ];

    const i = Math.floor(
      Math.log(bytes) / Math.log(k)
    );

    return (
      parseFloat(
        (
          bytes /
          Math.pow(k, i)
        ).toFixed(1)
      ) +
      ' ' +
      sizes[i]
    );
  }

  async getDocuments(): Promise<
    MedicalDocument[]
  > {
    const response =
      await api.get<MedicalDocument[]>(
        '/documents'
      );

    return response.data;
  }

  async saveDocument(
    document: MedicalDocument
  ): Promise<MedicalDocument> {
    const response =
      await api.post<MedicalDocument>(
        '/documents',
        document
      );

    return response.data;
  }

  async deleteDocument(
    id: string
  ): Promise<void> {
    await api.delete(
      `/documents/${encodeURIComponent(id)}`
    );
  }
}

export const documentService =
  new DocumentService();