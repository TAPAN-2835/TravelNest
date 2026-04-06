import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Shield, AlertTriangle, CheckCircle, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusConfig = {
  valid: { label: "Valid", color: "bg-success/10 text-success", icon: CheckCircle },
  expiring: { label: "Expiring Soon", color: "bg-warning/10 text-warning", icon: AlertTriangle },
  expired: { label: "Expired", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

export default function DocumentVault() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    try {
      const { documentApi } = await import("@/api/documents");
      const { data } = await documentApi.getDocuments();
      setDocs(data);
    } catch (err) {
      console.error(err);
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
        type: file.type.split('/')[1].toUpperCase(),
        s3Key: key,
        expiryDate: new Date(Date.now() + 31536000000).toISOString(),
      });

      toast.success("Document uploaded successfully");
      fetchDocs();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Document Vault</h2>
          <p className="text-sm text-muted-foreground mt-1">Store and manage your travel documents securely</p>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="rounded-lg bg-primary text-primary-foreground">
          {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          {uploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
      >
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">Drag & drop files here</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No documents found. Start by uploading one!
          </div>
        )}
        {docs.map((doc, i) => {
          const statusKey = doc.status?.toLowerCase() || "valid";
          const status = (statusConfig as any)[statusKey] || statusConfig.valid;
          return (
            <motion.div
              key={doc.id || i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-card rounded-xl border border-border shadow-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
                  <status.icon className="h-3 w-3" />
                  {status.label}
                </div>
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">{doc.type}</h4>
              <p className="text-xs text-muted-foreground mb-2">{doc.name}</p>
              <p className="text-xs text-muted-foreground">Expires: {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}</p>
              <Button onClick={() => window.open(import.meta.env.VITE_CDN_URL + '/' + doc.s3Key)} variant="ghost" size="sm" className="mt-3 text-xs h-7 w-full justify-start">
                <Eye className="h-3 w-3 mr-1" /> Preview
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
