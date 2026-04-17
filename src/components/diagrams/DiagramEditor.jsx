import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import Editor from '@monaco-editor/react';
import Loading from '../../ui/loading';
import MermaidRenderer from './MermaidRenderer';

const defaultCode = `graph TD
    A[Inicio] --> B{¿Es Nuevo?}
    B -->|Sí| C[Crear]
    B -->|No| D[Editar]
    C --> E[Guardar]
    D --> E
    E --> F[Fin]`;

export default function DiagramEditor({ open, onOpenChange, initialData, onSave }) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState(defaultCode);
  const [debouncedCode, setDebouncedCode] = useState(defaultCode);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setCode(initialData.code);
        setDebouncedCode(initialData.code);
      } else {
        setTitle('');
        setCode(defaultCode);
        setDebouncedCode(defaultCode);
      }
    }
  }, [open, initialData]);

  // Simple debouncing logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCode(code);
    }, 800);

    return () => {
      clearTimeout(handler);
    };
  }, [code]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSave({
        id: initialData?.id,
        title,
        code
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col sm:max-w-6xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Diagrama' : 'Nuevo Diagrama'}</DialogTitle>
          <DialogDescription>
            Usa el editor de código para crear tu diagrama Mermaid.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Diagrama de flujo del proceso"
            />
          </div>

          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 border-t pt-4">
            {/* Editor Section */}
            <div className="flex-1 flex flex-col min-h-[300px] border rounded-md overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-sm font-medium border-b">Código Mermaid</div>
              <div className="flex-1 relative">
                <Editor
                  height="100%"
                  defaultLanguage="mermaid"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                  }}
                  loading={<Loading message="Cargando editor..." fullScreen={false} />}
                />
              </div>
            </div>

            {/* Preview Section */}
            <div className="flex-1 flex flex-col min-h-[300px] border rounded-md overflow-hidden bg-slate-50">
              <div className="bg-slate-100 px-4 py-2 text-sm font-medium border-b">Vista Previa (Actualiza al pausar)</div>
              <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
                <MermaidRenderer code={debouncedCode} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || loading} className="bg-primary hover:bg-primary/90">
            {loading ? 'Guardando...' : 'Guardar Diagrama'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
