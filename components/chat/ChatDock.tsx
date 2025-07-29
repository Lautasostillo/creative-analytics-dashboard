'use client';
import { useState } from 'react';
import { VimEditor } from '@/components/vim/VimEditor';

export default function ChatDock() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [useVim, setUseVim] = useState(false);

  const handleSubmit = () => {
    if (input.trim()) {
      console.log('Sending message:', input);
      setInput('');
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 px-4 py-2 rounded bg-violet-600 text-white"
      >AI</button>
      {open && (
        <div className="fixed bottom-16 right-4 w-80 h-96 bg-neutral-900 border border-neutral-700 rounded flex flex-col">
          <div className="flex-1 p-2 overflow-auto text-sm text-neutral-300">
            <div className="mb-2">AI Assistant (Coming soon...)</div>
            <div className="text-xs text-neutral-500">
              Try vim mode in the input below!
              <br />• Press 'i' to enter insert mode
              <br />• Press Escape to enter normal mode  
              <br />• Use 'yy' to yank line, 'p' to paste
              <br />• Use 'yw' to yank word, 'y$' to yank to end of line
            </div>
          </div>
          
          <div className="p-2 border-t border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400">Input Mode:</span>
              <button
                onClick={() => setUseVim(!useVim)}
                className={`px-2 py-1 text-xs rounded ${
                  useVim 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-neutral-700 text-neutral-300'
                }`}
              >
                {useVim ? 'VIM' : 'Normal'}
              </button>
            </div>
            
            {useVim ? (
              <VimEditor
                value={input}
                onChange={setInput}
                placeholder="Ask something (VIM mode)"
                rows={3}
                className="bg-neutral-800 border-neutral-600 text-neutral-100 text-sm"
              />
            ) : (
              <div className="flex gap-2">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Ask something"
                  className="flex-1 p-2 bg-neutral-800 text-sm outline-none text-neutral-100 border border-neutral-600 rounded"
                />
                <button
                  onClick={handleSubmit}
                  className="px-3 py-2 bg-violet-600 text-white text-sm rounded hover:bg-violet-700"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
