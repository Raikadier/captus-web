import React, { useState } from 'react'
import { GitBranch, Plus, Pencil, Trash2, Layout } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../ui/card'
import { Button } from '../../ui/button'
import { useDiagrams } from '../../hooks/useDiagrams'
import MermaidRenderer from '../../components/diagrams/MermaidRenderer'
import DiagramEditor from '../../components/diagrams/DiagramEditor'
import ErrorBoundary from '../../components/shared/ErrorBoundary'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"
import { toast } from "sonner"

export default function TeacherDiagramsPage() {
  const { diagrams, loading, createDiagram, updateDiagram, deleteDiagram } = useDiagrams();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingDiagram, setEditingDiagram] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleCreate = () => {
    setEditingDiagram(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (diagram) => {
    setEditingDiagram(diagram);
    setIsEditorOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      const result = await deleteDiagram(deleteId);
      if (result.success) {
        toast.success("Diagrama eliminado correctamente");
      } else {
        toast.error("Error al eliminar el diagrama");
      }
      setDeleteId(null);
    }
  };

  const handleSave = async (data) => {
    let result;
    if (data.id) {
      result = await updateDiagram(data.id, data);
      if (result.success) toast.success("Diagrama actualizado correctamente");
    } else {
      result = await createDiagram(data);
      if (result.success) toast.success("Diagrama creado correctamente");
    }

    if (!result.success) {
      toast.error(result.error || "Ha ocurrido un error");
    }
    return result;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-card rounded-xl shadow-sm p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <GitBranch className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Diagramas</h1>
            <p className="text-sm text-muted-foreground">Gestión de visualizaciones académicas</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Nuevo Diagrama
        </Button>
      </div>

      {loading && diagrams.length === 0 ? (
         <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
         </div>
      ) : diagrams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Layout className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No hay diagramas todavía</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
              Crea diagramas para explicar conceptos complejos visualmente a tus estudiantes.
            </p>
            <Button onClick={handleCreate} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Crear mi primer diagrama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {diagrams.map((diagram) => (
            <Card key={diagram.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex justify-between items-start gap-2">
                  <span className="truncate" title={diagram.title}>{diagram.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-[200px] bg-muted p-4 flex items-center justify-center relative group">
                <div className="w-full h-full overflow-hidden max-h-[250px]">
                   <div className="transform scale-90 origin-center pointer-events-none">
                     <MermaidRenderer code={diagram.code} />
                   </div>
                </div>
                <div className="absolute inset-0 bg-background/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Button variant="secondary" size="sm" onClick={() => handleEdit(diagram)}>
                     Ver detalles
                   </Button>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/50 flex justify-between">
                 <span className="text-xs text-muted-foreground">
                   Actualizado: {new Date(diagram.updatedAt).toLocaleDateString()}
                 </span>
                 <div className="flex gap-2">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleEdit(diagram)}>
                     <Pencil className="w-4 h-4" />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteClick(diagram.id)}>
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ErrorBoundary>
        <DiagramEditor
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          initialData={editingDiagram}
          onSave={handleSave}
        />
      </ErrorBoundary>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El diagrama se eliminará permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
