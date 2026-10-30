import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';

export function BarcodeScannerModal({ isOpen, onClose, onScan, title = 'Scan Product Barcode' }) {
  const [errorMsg, setErrorMsg] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef(null);
  const readerId = 'barcode-reader-container';

  useEffect(() => {
    let html5QrCode = null;

    if (isOpen) {
      setErrorMsg(null);
      // Wait for DOM element
      const timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode(readerId);
          scannerRef.current = html5QrCode;

          html5QrCode
            .start(
              { facingMode: 'environment' },
              {
                fps: 10,
                qrbox: { width: 250, height: 160 },
                aspectRatio: 1.333,
              },
              (decodedText) => {
                // Success
                if (scannerRef.current) {
                  scannerRef.current.stop().catch(() => {});
                }
                onScan(decodedText);
                onClose();
              },
              (error) => {
                // Non-fatal scanning frame error
              }
            )
            .catch((err) => {
              console.warn('Camera start error:', err);
              setErrorMsg(
                'Camera access was denied or not available. You can enter or simulate the barcode below.'
              );
            });
        } catch (e) {
          console.warn('Html5Qrcode init error:', e);
          setErrorMsg('Camera initialization failed.');
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.stop().catch(() => {});
          scannerRef.current = null;
        }
      };
    }
  }, [isOpen, onClose, onScan]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
      onScan(manualCode.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4 text-center">
        {/* Scanner view */}
        <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700 min-h-[240px] flex items-center justify-center">
          <div id={readerId} className="w-full h-full" />
          {errorMsg && (
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center bg-slate-900/90 text-white space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <p className="text-xs text-slate-300">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Manual Barcode fallback / Simulation */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-left">
          <p className="text-xs font-medium text-slate-500 mb-2">
            Or type / simulate barcode manually:
          </p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              placeholder="e.g. 890123456701"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary" size="sm">
              Apply
            </Button>
          </form>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
