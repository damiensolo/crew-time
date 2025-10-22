import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { TASKS } from '../constants';
import type { Task } from '../types';
import { XIcon } from './icons';

// --- Start of inlined ImageModal component ---
interface ImageModalProps {
  src: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 animate-fadeIn"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <button
        onClick={(e) => {
            e.stopPropagation();
            onClose();
        }}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10 bg-black/30 rounded-full p-1"
        aria-label="Close image view"
      >
        <XIcon className="w-6 h-6" />
      </button>

      {/* Clicks on this container should not close the modal */}
      <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt="Full screen view of attached"
          className="w-full h-full object-cover"
          style={{ animation: 'fadeInUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        />
      </div>
    </div>
  );
};
// --- End of inlined ImageModal component ---


// --- Start of inlined ActionSheet component ---
export interface ActionSheetAction {
  label: string;
  onClick: () => void;
  isDestructive?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  actions: ActionSheetAction[];
}

const ActionSheet: React.FC<ActionSheetProps> = ({ isOpen, onClose, actions }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center" 
      aria-modal="true" 
      role="dialog"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="relative z-10 w-full max-w-sm p-2 pb-3">
        <div className="flex flex-col space-y-2" style={{ animation: 'fadeInUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
          {/* Action Group */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl">
            {actions.map((action, index) => (
              <React.Fragment key={action.label}>
                <button
                  onClick={() => {
                    action.onClick();
                    onClose();
                  }}
                  className={`w-full p-3 text-center text-lg transition-colors ${
                    action.isDestructive ? 'text-red-500' : 'text-blue-500'
                  } active:bg-slate-300/60`}
                >
                  {action.label}
                </button>
                {index < actions.length - 1 && <hr className="border-slate-300/50" />}
              </React.Fragment>
            ))}
          </div>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full p-3 text-center text-lg text-blue-500 font-semibold bg-white rounded-xl active:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
// --- End of inlined ActionSheet component ---

interface Photo {
  id: number;
  url: string;
}

const TaskList: React.FC = () => {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [attachedPhotos, setAttachedPhotos] = useState<Record<number, Photo[]>>({});
  
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);


  const handleToggle = (taskId: number) => {
    setExpandedTaskId(prevId => (prevId === taskId ? null : taskId));
  };

  const handleAttachPhoto = (taskId: number) => {
    if (!taskId) return;
    setAttachedPhotos(prev => {
      const existingPhotos = prev[taskId] || [];
      const newPhoto = {
        id: Date.now(),
        // Using a unique seed for each photo to get different images
        url: `https://picsum.photos/seed/${taskId}-${existingPhotos.length}-${Date.now()}/200/200`
      };
      return {
        ...prev,
        [taskId]: [...existingPhotos, newPhoto]
      };
    });
  };

  const handleRemovePhoto = (taskId: number, photoId: number) => {
    setAttachedPhotos(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || []).filter(photo => photo.id !== photoId)
    }));
  };

  const handleOpenAttachmentSheet = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsActionSheetOpen(true);
  };

  const handlePhotoClick = (url: string) => {
    setSelectedImageUrl(url);
  };

  const actions: ActionSheetAction[] = [
    { label: 'Take Photo', onClick: () => { if (selectedTaskId) handleAttachPhoto(selectedTaskId); } },
    { label: 'Photo Gallery', onClick: () => { if (selectedTaskId) handleAttachPhoto(selectedTaskId); } },
    { label: 'Attach File', onClick: () => { alert('File attachment coming soon!'); } },
  ];

  return (
    <>
      <div className="space-y-3">
        {TASKS.map((task: Task) => (
          <TaskCard 
            key={task.id} 
            task={task}
            isExpanded={expandedTaskId === task.id}
            onToggle={() => handleToggle(task.id)}
            photos={attachedPhotos[task.id] || []}
            onOpenAttachmentSheet={handleOpenAttachmentSheet}
            onRemovePhoto={handleRemovePhoto}
            onPhotoClick={handlePhotoClick}
          />
        ))}
      </div>
      <ActionSheet 
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        actions={actions}
      />
      {selectedImageUrl && (
        <ImageModal 
          src={selectedImageUrl} 
          onClose={() => setSelectedImageUrl(null)} 
        />
      )}
    </>
  );
};

export default TaskList;