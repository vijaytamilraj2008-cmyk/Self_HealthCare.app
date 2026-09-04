import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { documentService, AnalysisStage } from '../services/documentService';
import { dataMigrationService } from '../services/dataMigrationService';
import { timelineService } from '../services/timelineService';
import { pdfService } from '../services/pdfService';
import { MedicalDocument, DetectedMedicine } from '../types';
import {
  FileText,
  Upload,
  Download,
  QrCode,
  Pill,
  Trash2,
  Info,
  Stethoscope,
  Building2,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { QRShareModal } from '../components/modals/QRShareModal';

interface DocumentsPageProps {
  onNavigate: (page: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!user) { setDocuments([]); setSelectedDoc(null); return; }
    (async () => {
      try {
        await dataMigrationService.migrateForUser(user.id);
        const latest = await documentService.getDocuments();
        if (mounted) { setDocuments(latest); setSelectedDoc(current => current && latest.some(d => d.id === current.id) ? current : latest[0] || null); }
      } catch (error) {
        console.error('Failed to load medical documents:', error);
        if (mounted) { setDocuments([]); setSelectedDoc(null); }
      }
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  // Upload & Analysis State
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('idle');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string>('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadError('');
    setAnalysisStage('reading');
    setAnalysisProgress(15);

    try {
      const result = await documentService.processDocument(
        file,
        user.id,
        (stage: AnalysisStage, progress: number) => {
          setAnalysisStage(stage);
          setAnalysisProgress(progress);
        }
      );

      const saved = await documentService.saveDocument(result.document);
      await timelineService.addEvent({
        id: `tl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId: user.id,
        title: `Medical Document Analyzed (${saved.documentType})`,
        description: `Uploaded \"${saved.fileName}\" with ${saved.medicinesDetected.length} medicine(s) extracted and verified.`,
        category: 'document',
        timestamp: new Date().toISOString(),
        badgeText: saved.documentType
      });
      const updated = await documentService.getDocuments();
      setDocuments(updated);
      setSelectedDoc(saved);

      // Clear input
      e.target.value = '';
    } catch (err: any) {
      setAnalysisStage('error');
      setUploadError(err?.message || 'Failed to analyze document. Please upload a clear PDF or image.');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Delete this medical document record from your command center?')) {
      await documentService.deleteDocument(id);
      const updated = await documentService.getDocuments();
      setDocuments(updated);
      setSelectedDoc(updated[0] || null);
    }
  };

  const handleDownloadPdf = () => {
    if (user) {
      pdfService.generateHealthSummaryPdf(user).catch(error => console.error('Failed to generate health summary PDF:', error));
    }
  };

  const getAttentionBadge = (level: 'routine' | 'discuss' | 'prompt') => {
    switch (level) {
      case 'routine':
        return <span className="badge badge-emerald">🟢 Routine</span>;
      case 'discuss':
        return <span className="badge badge-amber">🟠 Discuss with Doctor</span>;
      case 'prompt':
        return <span className="badge badge-rose">🔴 Prompt Attention Needed</span>;
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-emerald">Multi-Page OCR & PDF Engine</span>
            <span className="badge badge-neutral">Strict Zero-Hallucination</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Medical Document Understanding</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Upload prescriptions, scan reports, or lab results for structured clinical understanding without invented diseases.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleDownloadPdf} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <Download size={15} color="#10b981" /> Download PDF (₹)
          </button>
          <button onClick={() => setIsQrModalOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <QrCode size={15} /> 24h Share QR
          </button>
        </div>
      </div>

      {/* UPLOAD BOX WITH FOUR-STAGE PIPELINE */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px', border: '1px dashed rgba(16, 185, 129, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Upload size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Upload Medical Document (PDF, JPG, PNG, WEBP)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Supports text PDFs plus scanned/image-only PDFs and clear prescription slips. Uses real OCR when selectable text is unavailable.
              </p>
            </div>
          </div>

          <label className="btn btn-primary" style={{ cursor: 'pointer', margin: 0 }}>
            <FileText size={16} /> Select File to Analyze
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* PROCESSING STAGES ANIMATION */}
        {analysisStage !== 'idle' && analysisStage !== 'error' && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>
              <span style={{ color: '#38bdf8' }}>
                {analysisStage === 'reading' && 'Stage 1/4: Reading Document & Extracting All Pages...'}
                {analysisStage === 'analyzing' && 'Stage 2/4: Analyzing Clinical Text & Medication Schedules...'}
                {analysisStage === 'preparing' && 'Stage 3/4: Preparing Structured Summary & Safety Checks...'}
                {analysisStage === 'completed' && 'Stage 4/4: Complete! Analysis Ready.'}
              </span>
              <span style={{ color: '#10b981' }}>{analysisProgress}%</span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${analysisProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>

            {/* Pipeline Stage Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '12px', textAlign: 'center', fontSize: '11px' }}>
              <div style={{ color: analysisStage === 'reading' || analysisProgress >= 25 ? '#38bdf8' : 'var(--text-muted)' }}>
                1. Reading
              </div>
              <div style={{ color: analysisStage === 'analyzing' || analysisProgress >= 55 ? '#38bdf8' : 'var(--text-muted)' }}>
                2. Analyzing
              </div>
              <div style={{ color: analysisStage === 'preparing' || analysisProgress >= 85 ? '#38bdf8' : 'var(--text-muted)' }}>
                3. Preparing Summary
              </div>
              <div style={{ color: analysisStage === 'completed' ? '#10b981' : 'var(--text-muted)' }}>
                4. Completed
              </div>
            </div>
          </div>
        )}

        {uploadError && (
          <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* DOCUMENTS WORKSPACE (SIDEBAR LIST + DETAIL INSPECTOR) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* LEFT COLUMN: LIST OF UPLOADED DOCUMENTS */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
            Uploaded Records ({documents.length})
          </div>

          {documents.length === 0 ? (
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
              <FileText size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No documents uploaded yet</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Upload your prescription above to see analysis.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="glass-card glass-card-interactive"
                    style={{
                      padding: '14px 16px',
                      cursor: 'pointer',
                      borderColor: isSelected ? '#10b981' : 'var(--border-glass)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.08)' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span className="badge badge-emerald" style={{ fontSize: '10px' }}>{doc.documentType}</span>
                          {getAttentionBadge(doc.attentionLevel)}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {doc.fileName}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(doc.uploadDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {doc.fileSize}
                          {doc.pageCount && doc.pageCount > 1 ? ` • ${doc.pageCount} Pages` : ''}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc.id);
                        }}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#f87171', padding: '4px' }}
                        title="Delete record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DOCUMENT DETAIL & PRESCRIPTION EXPLAINER */}
        {selectedDoc ? (
          <div className="glass-card" style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-emerald">{selectedDoc.documentType}</span>
                  {getAttentionBadge(selectedDoc.attentionLevel)}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>
                  {selectedDoc.fileName}
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Uploaded on {new Date(selectedDoc.uploadDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  {selectedDoc.pageCount && ` • Analyzed ${selectedDoc.pageCount} complete page(s)`}
                </div>
              </div>
            </div>

            {/* Doctor & Facility Detected */}
            {(selectedDoc.doctorName || selectedDoc.hospitalName) && (
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-glass)', marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {selectedDoc.doctorName && (
                  <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Stethoscope size={14} color="#10b981" />
                    <span>Physician: <strong>{selectedDoc.doctorName}</strong></span>
                  </div>
                )}
                {selectedDoc.hospitalName && (
                  <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} color="#38bdf8" />
                    <span>Clinic: <strong>{selectedDoc.hospitalName}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Simple Summary */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Simple Summary
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5, background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                {selectedDoc.simpleSummary}
              </div>
            </div>

            {/* OCR / extracted text verification */}
            {selectedDoc.rawExtractedText && (
              <details style={{ marginBottom: '18px', background: 'rgba(56, 189, 248, 0.04)', border: '1px solid rgba(56, 189, 248, 0.18)', borderRadius: '10px', overflow: 'hidden' }}>
                <summary style={{ cursor: 'pointer', padding: '12px 14px', fontSize: '13px', fontWeight: '700', color: '#7dd3fc' }}>
                  View detected text (formatted for reading)
                </summary>
                <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px 14px 14px' }}>
                  {selectedDoc.rawExtractedText
                    .split(/\r?\n/)
                    .map((line) => line.replace(/\s+/g, ' ').trim())
                    .filter(Boolean)
                    .map((line, idx) => {
                      const isPageHeader = /^---\s*Page\s+\d+\s*---$/i.test(line);
                      const cleaned = line
                        .replace(/^[|]+\s*/, '')
                        .replace(/\s*[|]+$/, '')
                        .replace(/\s{2,}/g, ' ')
                        .trim();

                      return (
                        <div
                          key={`${selectedDoc.id}-ocr-${idx}`}
                          style={{
                            padding: isPageHeader ? '10px 10px 6px' : '7px 10px',
                            marginTop: isPageHeader ? '4px' : '0',
                            background: isPageHeader ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.02)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: isPageHeader ? '8px' : '0',
                            color: isPageHeader ? '#7dd3fc' : 'var(--text-secondary)',
                            fontSize: isPageHeader ? '12px' : '13px',
                            fontWeight: isPageHeader ? '800' : '500',
                            lineHeight: 1.55,
                            wordBreak: 'break-word'
                          }}
                        >
                          {cleaned || line}
                        </div>
                      );
                    })}
                </div>
                <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(56, 189, 248, 0.12)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  The text above is the extracted OCR/PDF text, reformatted only for easier reading. It is not rewritten or medically inferred.
                </div>
              </details>
            )}

            {/* Explicit Diagnosis (NEVER INVENTED) */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Explicit Diagnosis / Clinical Condition
              </div>
              <div style={{ fontSize: '13px', color: selectedDoc.explicitDiagnosis?.includes('No specific diagnosis') ? '#94a3b8' : '#38bdf8', padding: '10px 14px', background: 'rgba(56, 189, 248, 0.06)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                {selectedDoc.explicitDiagnosis || 'No specific diagnosis or condition was clearly identified in the uploaded prescription.'}
              </div>
            </div>

            {/* PRESCRIPTION EXPLAINER SECTION */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Pill size={16} color="#10b981" />
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  Prescription Explainer ({selectedDoc.medicinesDetected.length} Detected)
                </h3>
              </div>

              {selectedDoc.medicinesDetected.length === 0 ? (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  This information could not be read clearly from the uploaded document. Please upload a higher resolution copy if this is a medication slip.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedDoc.medicinesDetected.map((med: DetectedMedicine, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '10px',
                        border: '1px solid var(--border-glass)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>
                          {med.name}
                        </div>
                        <span className="badge badge-neutral">{med.strength}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '8px' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Detected Instructions:</span>{' '}
                          <strong style={{ color: 'var(--text-primary)' }}>{med.instructions}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Duration:</span>{' '}
                          <strong style={{ color: 'var(--text-primary)' }}>{med.duration}</strong>
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: '#cbd5e1', background: 'rgba(16, 185, 129, 0.06)', padding: '6px 10px', borderRadius: '6px' }}>
                        💡 <strong>General Purpose:</strong> {med.purpose}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Important Findings */}
            {selectedDoc.importantFindings.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Important Findings
                </div>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedDoc.importantFindings.map((finding: string, idx: number) => (
                    <li key={idx}>{finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medical Terms */}
            {selectedDoc.medicalTerms.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  <BookOpen size={14} color="#38bdf8" />
                  Medical Terms Glossary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                  {selectedDoc.medicalTerms.map((t: { term: string; explanation: string }, idx: number) => (
                    <div key={idx} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '12px' }}>
                      <div style={{ fontWeight: '700', color: '#38bdf8' }}>{t.term}</div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{t.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mandatory Disclaimers */}
            <div style={{ padding: '12px 14px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', fontSize: '12px', color: '#fbbf24', lineHeight: 1.4 }}>
              <div>⚠️ <strong>Clinical Notice:</strong> Follow the instructions provided by your doctor or pharmacist.</div>
              <div style={{ marginTop: '3px', color: 'var(--text-secondary)' }}>
                "This summary is for understanding the document and does not replace professional medical advice."
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <Info size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Select a document to view full analysis</div>
          </div>
        )}
      </div>

      {isQrModalOpen && (
        <QRShareModal onClose={() => setIsQrModalOpen(false)} />
      )}
    </div>
  );
};
