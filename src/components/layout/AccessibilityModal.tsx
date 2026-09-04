import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { FontSizeOption } from '../../types';
import { Eye, Type, ZapOff, Check, X, Sparkles } from 'lucide-react';

export const AccessibilityModal: React.FC = () => {
  const {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    reduceAnimations,
    setReduceAnimations,
    isA11yModalOpen,
    setA11yModalOpen
  } = useAccessibility();

  if (!isA11yModalOpen) return null;

  const fontOptions: { key: FontSizeOption; label: string; desc: string; sizePx: string }[] = [
    { key: 'sm', label: 'Small', desc: 'Compact view', sizePx: '13px' },
    { key: 'md', label: 'Medium', desc: 'Default baseline', sizePx: '15px' },
    { key: 'lg', label: 'Large', desc: 'Enhanced legibility', sizePx: '17px' },
    { key: 'xl', label: 'Extra Large', desc: 'Maximum readability', sizePx: '20px' }
  ];

  return (
    <div className="modal-overlay" onClick={() => setA11yModalOpen(false)}>
      <div
        className="modal-dialog glass-card-elevated"
        style={{ maxWidth: '520px', padding: '24px' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="a11y-modal-title"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Eye size={20} />
            </div>
            <div>
              <h3 id="a11y-modal-title" style={{ fontSize: '18px', fontWeight: '700' }}>Accessibility Preferences</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Customize your visual and interaction experience</p>
            </div>
          </div>
          <button
            onClick={() => setA11yModalOpen(false)}
            className="btn btn-ghost btn-sm"
            aria-label="Close accessibility modal"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Font Size Scaling */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Type size={16} color="var(--emerald)" />
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Text Size Scaling
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {fontOptions.map(opt => {
              const isSelected = fontSize === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setFontSize(opt.key)}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    flexDirection: 'column',
                    padding: '12px 6px',
                    borderRadius: '10px',
                    borderColor: isSelected ? '#10b981' : 'var(--border-glass)'
                  }}
                >
                  <span style={{ fontSize: opt.sizePx, fontWeight: '700' }}>A</span>
                  <span style={{ fontSize: '11px', marginTop: '4px' }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Current size: <strong style={{ color: 'var(--text-primary)' }}>{fontSize.toUpperCase()}</strong> (Live scale applied across all screens)
          </p>
        </div>

        {/* 2. High Contrast Mode */}
        <div style={{ marginBottom: '20px', padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>High Contrast Mode</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pure black background with maximum contrast borders & text</div>
              </div>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`btn ${highContrast ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ minWidth: '70px' }}
            >
              {highContrast ? <Check size={14} /> : null}
              {highContrast ? 'Enabled' : 'Off'}
            </button>
          </div>
        </div>

        {/* 3. Reduced Motion */}
        <div style={{ marginBottom: '24px', padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <ZapOff size={16} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Reduce Animations</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Disables transitions and micro-animations for visual comfort</div>
              </div>
            </div>
            <button
              onClick={() => setReduceAnimations(!reduceAnimations)}
              className={`btn ${reduceAnimations ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ minWidth: '70px' }}
            >
              {reduceAnimations ? <Check size={14} /> : null}
              {reduceAnimations ? 'Enabled' : 'Off'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={() => setA11yModalOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
