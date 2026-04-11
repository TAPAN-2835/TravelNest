import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Shield, AlertTriangle, CheckCircle, Eye, Loader2, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusConfig = {
  valid: { label: "Valid", color: "bg-success/10 text-success", icon: CheckCircle },
  expiring: { label: "Expiring Soon", color: "bg-warning/10 text-warning", icon: AlertTriangle },
  expired: { label: "Expired", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

export default function DocumentVault() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 31536000000).toISOString().split('T')[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    try {
      const { documentApi } = await import("@/api/documents");
      const { data } = await documentApi.getDocuments();
      setDocs(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { documentApi } = await import("@/api/documents");
      const { data: { uploadUrl, key } } = await documentApi.getUploadUrl(file.name, file.type);
      
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      await documentApi.saveDocumentMetadata({
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || "FILE",
        s3Key: key,
        expiryDate: new Date(expiryDate).toISOString(),
      });

      toast.success("Document uploaded successfully");
      fetchDocs();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { documentApi } = await import("@/api/documents");
      await documentApi.deleteDocument(id);
      toast.success("Document deleted");
      fetchDocs();
    } catch (err) {
      toast.error("Failed to delete document");
    }
  };

  const isExpiring = (date: string) => {
     const expiry = new Date(date).getTime();
     const now = Date.now();
     const diff = expiry - now;
     if (diff < 0) return "expired";
     if (diff < 30 * 24 * 60 * 60 * 1000) return "expiring";
     return "valid";
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Document Vault</h2>
          <p className="text-sm text-muted-foreground mt-1">Store and manage your travel documents securely</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex flex-col gap-1">
             <Label htmlFor="expiry" className="text-[10px] uppercase font-bold text-muted-foreground">Expiry Date</Label>
             <Input 
                id="expiry"
                type="date" 
                value={expiryDate} 
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-9 w-36 text-xs"
             />
           </div>
           <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
           <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="rounded-lg bg-primary text-primary-foreground h-11 mt-auto">
             {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
             {uploading ? "Uploading..." : "Upload File"}
           </Button>
        </div>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="group border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden"
      >
        <div className="relative z-10">
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-foreground">Drag & drop files here</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {docs.length === 0 ? (
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="col-span-full py-12 text-center text-muted-foreground border rounded-2xl bg-muted/20 border-dashed">
              No documents found. Start by uploading one!
            </motion.div>
          ) : (
            docs.map((doc, i) => {
              const statusKey = isExpiring(doc.expiryDate);
              const status = (statusConfig as any)[statusKey] || statusConfig.valid;
              return (
                <motion.div
                  key={doc.id || i}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ y: -4 }}
                  className="bg-card rounded-xl border border-border shadow-card p-5 group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${status.color}`}>
                      <status.icon className="h-3.5 w-3.5" />
                      {status.label}
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-bold text-foreground mb-1 mt-auto">{doc.type}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{doc.name}</p>
                  
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-4 font-medium">
                    <Calendar className="h-3 w-3" />
                    Expires: {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'No Limit'}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => window.open(doc.s3Key? (import.meta.env.VITE_CDN_URL ? `${import.meta.env.VITE_CDN_URL}/${doc.s3Key}` : '#') : '#')} 
                      variant="outline" size="sm" className="text-xs h-8"
                    >
                      <Eye className="h-3.5 w-3.5 mr-2" /> View
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the document "{doc.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(doc.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
