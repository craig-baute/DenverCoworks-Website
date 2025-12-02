
import React, { useState, useRef } from 'react';
import { 
  Bold, Italic, Heading1, Heading2, Quote, List, ListOrdered, 
  Image as ImageIcon, Link as LinkIcon, Eye, Code, Upload, X, 
  AlignCenter, Minus, Type, Terminal
} from 'lucide-react';
import { useData } from './DataContext';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label }) => {
  const { uploadFile } = useData();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Helper to insert text tags around selection
  const insertTag = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newValue = `${before}${prefix}${selection}${suffix}${after}`;
    onChange(newValue);
    
    // Restore focus (setTimeout needed for React state update cycle)
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      // Insert HTML image tag with styles
      const imgTag = `\n<img src="${url}" alt="Blog Image" class="w-full h-auto rounded-sm my-6 shadow-md" />\n`;
      insertTag(imgTag, '');
    } catch (err) {
      alert('Failed to upload image inside editor');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };
  
  const handleLinkInsert = () => {
    const url = prompt("Enter URL:");
    if (url) {
      insertTag(`<a href="${url}" class="text-blue-600 underline hover:text-blue-800" target="_blank">`, '</a>');
    }
  };

  return (
    <div className="border border-neutral-300 bg-white flex flex-col h-[600px] shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10">
        <div className="flex gap-1 mr-2">
          <button type="button" onClick={() => insertTag('<strong>', '</strong>')} className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700" title="Bold">
            <Bold className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertTag('<em>', '</em>')} className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700" title="Italic">
            <Italic className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertTag('<u>', '</u>')} className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700" title="Underline">
            <Type className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-neutral-300 mx-1"></div>

        <div className="flex gap-1 mr-2">
          <button type="button" onClick={() => insertTag('<h2>', '</h2>\n')} className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700" title="Heading 2">
            <Heading1 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertTag('<h3>', '</h3>\n')} className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700" title="Heading 3">
            <Heading2 className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-neutral-300 mx-1"></div>

        <div className="flex gap-1 mr-2">
          <button type="button" onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>\n')} className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700" title="Bullet List">
            <List className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertTag('<ol>\n  <li>', '</li>\n</ol>\n')} className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700" title="Ordered List">
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-neutral-300 mx-1"></div>

        <div className="flex gap-1 mr-2">
          <button type="button" onClick={() => insertTag('<blockquote>', '</blockquote>\n')} className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700" title="Blockquote">
            <Quote className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertTag('<pre class="bg-neutral-100 p-4 rounded text-sm font-mono overflow-x-auto">\n', '\n</pre>\n')} className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700" title="Code Block">
            <Terminal className="w-4 h-4" />
          </button>
           <button type="button" onClick={() => insertTag('<div class="text-center">\n', '\n</div>\n')} className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700" title="Center Align">
            <AlignCenter className="w-4 h-4" />
          </button>
           <button type="button" onClick={() => insertTag('\n<hr class="my-8 border-neutral-300" />\n', '')} className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700" title="Divider">
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-neutral-300 mx-1"></div>
        
        <div className="flex gap-1">
          {/* Image Upload Button */}
          <label className={`p-1.5 hover:bg-neutral-200 rounded cursor-pointer flex items-center text-neutral-700 ${isUploading ? 'opacity-50' : ''}`} title="Insert Image">
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
            {isUploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div> : <ImageIcon className="w-4 h-4" />}
          </label>

          <button type="button" onClick={handleLinkInsert} className="p-1.5 hover:bg-neutral-200 rounded text-neutral-700" title="Link">
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1"></div>
        
        <button 
          type="button" 
          onClick={() => setIsPreview(!isPreview)} 
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${isPreview ? 'bg-blue-600 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'}`}
        >
          {isPreview ? <><Code className="w-3 h-3" /> Editor</> : <><Eye className="w-3 h-3" /> Preview</>}
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-hidden">
        {isPreview ? (
          <div className="absolute inset-0 p-6 overflow-y-auto bg-neutral-50">
             <div className="max-w-none prose prose-lg prose-neutral prose-img:rounded-md prose-headings:font-heavy prose-a:text-blue-600 bg-white p-8 shadow-sm min-h-full mx-auto">
               {/* Safe preview rendering */}
               <div dangerouslySetInnerHTML={{ __html: value }} />
               {!value && <p className="text-neutral-400 italic">Nothing to preview...</p>}
             </div>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            className="w-full h-full p-6 font-mono text-sm focus:outline-none resize-none leading-relaxed text-neutral-800"
            placeholder="Write your post here... Use the toolbar to format."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
      <div className="bg-neutral-100 px-4 py-2 text-[10px] text-neutral-500 border-t flex justify-between">
        <span>{label || 'Rich Text Editor'} &bull; Supports HTML & Tailwind classes</span>
        <span>{value.length} chars</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
