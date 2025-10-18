import React from 'react';
import type { Task } from '../types';
import { PhotoIcon, PaperclipIcon, ChatBubbleIcon, ChevronDownIcon } from './icons';

interface TaskCardProps {
  task: Task;
  isExpanded: boolean;
  onToggle: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isExpanded, onToggle }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm transition-shadow hover:shadow-md">
      <button onClick={onToggle} className="w-full text-left p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <h3 className="font-semibold text-slate-800 text-base truncate">{task.name}</h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">{task.type}</span>
          </div>
          <div className="flex items-center space-x-2">
            <p className="font-mono text-slate-600">00:00</p>
            <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-40' : 'max-h-0'}`}
      >
        <div className="px-4 pb-4">
          <hr className="mb-3"/>
          <div className="flex items-center justify-between text-sm text-slate-600 font-medium">
            <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-800">
                    <PhotoIcon className="w-5 h-5" />
                    <span>+ Image</span>
                </button>
                <button className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-800">
                    <PaperclipIcon />
                    <span>+ Attachment</span>
                </button>
            </div>
            <button className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-800">
                <ChatBubbleIcon />
                <span>Comments</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;