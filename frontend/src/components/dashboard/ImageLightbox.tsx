import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
}

export function ImageLightbox({ isOpen, onClose, imageUrl, imageName }: ImageLightboxProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden border-none bg-black/95 flex flex-col items-center justify-center">
        <DialogTitle className="sr-only">{imageName}</DialogTitle>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.img
                key={imageUrl}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                src={imageUrl}
                alt={imageName}
                className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg"
              />
            )}
          </AnimatePresence>
          
          <div className="absolute bottom-10 left-0 right-0 text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-8 py-4 rounded-3xl bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <h4 className="text-2xl font-black text-white mb-1">{imageName}</h4>
              <p className="text-[10px] text-white/50 uppercase tracking-[0.4em] font-black">Full Immersive View</p>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
