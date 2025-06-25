import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { toast } from 'sonner';

import TiptapMenuBar from '@/components/TiptapMenubar';
import { postsApi } from '@/api/postsApi';

const extensions = [
  StarterKit,
  Image.configure({
    inline: true,
    allowBase64: true,
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    HTMLAttributes: {
      class: 'text-blue-600 underline hover:text-blue-800',
    },
  }),
];

// const content = 'start writing...';

type TiptapProps = {
  onContentChange?: (value: string) => void;
  onImageChange?: (imgSrc: string) => void;
  content?: string;
};

function Tiptap({
  onContentChange,
  onImageChange,
  content = 'start writing...',
}: TiptapProps) {
  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange?.(html);
    },
    editorProps: {
      attributes: {
        class: 'min-h-96 py-2 px-4 tiptap-editor outline-none',
      },
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!editor) return;
    try {
      // Show loading state or placeholder
      const tempUrl = URL.createObjectURL(file);
      editor.chain().focus().setImage({ src: tempUrl }).run();

      // Request pre-signed URL
      const { data } = await postsApi.getPresignedUrl(file.name, file.type);
      const { url, fileLink } = data;

      // Upload to S3
      await postsApi.uploadToS3(url, file);

      // Replace the temporary image with the uploaded one
      const { state } = editor;
      const { doc } = state;

      // Find all image nodes with the temporary URL and replace them
      doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === tempUrl) {
          editor.chain().setNodeSelection(pos).run();
          editor.chain().focus().setImage({ src: fileLink }).run();

          // Add to images state
          onImageChange?.(fileLink);

          return false;
        }
        return true;
      });

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  return (
    <>
      <TiptapMenuBar editor={editor} onImageUpload={handleImageUpload} />
      <EditorContent editor={editor} />
    </>
  );
}

export default Tiptap;
