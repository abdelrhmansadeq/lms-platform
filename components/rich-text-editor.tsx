'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Undo, Redo, Heading2 } from 'lucide-react'
import { Button } from './ui/button'

export function RichTextEditor({
                                   content,
                                   onChangeAction, // <--- الاسم الجديد
                                   name = 'content'
                               }: {
    content: string;
    onChangeAction: (html: string) => void; // <--- الاسم الجديد
    name?: string;
}) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[150px] p-4 text-slate-200',
            },
        },
        onUpdate: ({ editor }) => {
            onChangeAction(editor.getHTML()) // <--- الاسم الجديد
        },
    })

    if (!editor) return null

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
            <div className="bg-white/5 border-b border-white/10 p-2 flex gap-1 items-center overflow-x-auto scrollbar-hide whitespace-nowrap">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`h-8 w-8 shrink-0 ${editor.isActive('bold') ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <Bold className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`h-8 w-8 shrink-0 ${editor.isActive('italic') ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <Italic className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`h-8 w-8 shrink-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <Heading2 className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`h-8 w-8 shrink-0 ${editor.isActive('bulletList') ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <List className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`h-8 w-8 shrink-0 ${editor.isActive('orderedList') ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                >
                    <ListOrdered className="w-4 h-4" />
                </Button>
                <div className="flex-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="h-8 w-8 shrink-0 text-slate-400 hover:text-white"
                >
                    <Undo className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="h-8 w-8 shrink-0 text-slate-400 hover:text-white"
                >
                    <Redo className="w-4 h-4" />
                </Button>
            </div>

            <EditorContent editor={editor} />

            <input type="hidden" name={name} value={editor.getHTML()} />
        </div>
    )
}