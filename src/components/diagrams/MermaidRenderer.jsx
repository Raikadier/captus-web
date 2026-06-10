import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import DOMPurify from 'dompurify';
import { Button } from '../../ui/button';
import { Download, FileImage, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict',
  fontFamily: 'arial, sans-serif',
  logLevel: 5,
});

const sanitizeSvg = (svg) =>
  DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } });

export default function MermaidRenderer({ code, allowExport = false }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const currentContainer = containerRef.current;

    const renderDiagram = async () => {
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
      setSvgContent('');
      setError(null);

      if (!code || !code.trim()) return;

      try {
        try {
          await mermaid.parse(code);
        } catch (parseError) {
          console.error('Mermaid parse error:', parseError);
          if (isMounted) setError(`Error de sintaxis: ${parseError.message}`);
          return;
        }

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        const safeSvg = sanitizeSvg(svg);

        if (isMounted && safeSvg) {
          setSvgContent(safeSvg);
          if (currentContainer) {
            currentContainer.innerHTML = safeSvg;
            const svgEl = currentContainer.querySelector('svg');
            if (svgEl) {
              svgEl.style.maxWidth = '100%';
              svgEl.style.height = 'auto';
              svgEl.removeAttribute('width');
              svgEl.removeAttribute('height');
            }
          }
        } else if (isMounted) {
          setError('No se pudo generar la imagen del diagrama.');
        }
      } catch (err) {
        console.error('Mermaid render fatal error:', err);
        if (isMounted) {
          setError(err.message || 'Error desconocido al renderizar diagrama');
        }
      }
    };

    const timeoutId = setTimeout(renderDiagram, 50);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [code]);

  const downloadImage = async (format) => {
    if (!containerRef.current) return;
    setIsExporting(true);

    try {
      const svgElement = containerRef.current.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      const svgRect = svgElement.getBoundingClientRect();
      const width = svgRect.width || 800;
      const height = svgRect.height || 600;

      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        if (format === 'png') {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `diagrama-${Date.now()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } else if (format === 'pdf') {
          const pdf = new jsPDF({
            orientation: width > height ? 'l' : 'p',
            unit: 'px',
            format: [width + 40, height + 40]
          });
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 20, 20, width, height);
          pdf.save(`diagrama-${Date.now()}.pdf`);
        }
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };

      img.src = url;
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
    }
  };

  const downloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagrama-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {error ? (
        <div className="w-full bg-destructive/10 border border-destructive/30 rounded-lg min-h-[100px] flex items-center justify-center p-4">
          <span className="text-sm text-destructive text-center">
            {error}
          </span>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="mermaid-container w-full overflow-auto bg-card rounded-xl min-h-[100px] flex items-center justify-center p-4"
        />
      )}

      {allowExport && svgContent && !error && (
        <div className="flex gap-2 justify-end mt-2">
          <Button variant="outline" size="sm" onClick={() => downloadImage('png')} disabled={isExporting}>
            <FileImage className="w-4 h-4 mr-1" /> PNG
          </Button>
          <Button variant="outline" size="sm" onClick={downloadSVG} disabled={isExporting}>
            <Download className="w-4 h-4 mr-1" /> SVG
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadImage('pdf')} disabled={isExporting}>
            <FileText className="w-4 h-4 mr-1" /> PDF
          </Button>
        </div>
      )}
    </div>
  );
}
