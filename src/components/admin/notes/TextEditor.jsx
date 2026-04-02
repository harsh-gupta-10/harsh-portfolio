import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Code, Image as ImageIcon, Table as TableIcon } from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const toggleBtnClass = (isActive) => 
    `p-2 rounded hover:bg-slate-700 transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400'}`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-900 border-b border-slate-700/50">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={toggleBtnClass(editor.isActive('bold'))}><Bold size={16}/></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={toggleBtnClass(editor.isActive('italic'))}><Italic size={16}/></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={toggleBtnClass(editor.isActive('underline'))}><UnderlineIcon size={16}/></button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={toggleBtnClass(editor.isActive('strike'))}><Strikethrough size={16}/></button>
      
      <div className="w-px h-6 bg-slate-700 mx-2" />
      
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 1 }))}><Heading1 size={16}/></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 2 }))}><Heading2 size={16}/></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 3 }))}><Heading3 size={16}/></button>

      <div className="w-px h-6 bg-slate-700 mx-2" />

      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={toggleBtnClass(editor.isActive('bulletList'))}><List size={16}/></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toggleBtnClass(editor.isActive('orderedList'))}><ListOrdered size={16}/></button>
      <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={toggleBtnClass(editor.isActive('taskList'))}><CheckSquare size={16}/></button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={toggleBtnClass(editor.isActive('codeBlock'))}><Code size={16}/></button>
      
      <div className="w-px h-6 bg-slate-700 mx-2" />

      <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={toggleBtnClass(false)}><TableIcon size={16}/></button>
    </div>
  );
};

export default function TextEditor({ initialContent, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-blue max-w-none focus:outline-none min-h-[500px] p-6'
      }
    },
    onUpdate: ({ editor }) => {
      // Pass back JSON
      onChange(editor.getJSON());
    }
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden shadow-inner">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
