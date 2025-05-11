import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { toast } from 'sonner';

import { postsApi } from '@/api/postsApi';
import { toolbarOptions } from '@/constants';

type EditorProps = { initialContent?: string };

const Editor = forwardRef(({ initialContent = '' }: EditorProps, ref) => {
  const localEditorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const uploadedImages = useRef<string[]>([]);

  useImperativeHandle(ref, () => ({
    getContent: () => quillRef.current?.root.innerHTML ?? '',
    getUploadedImages: () => [...uploadedImages.current],
    setContent: (content: string) => {
      if (quillRef.current && content) {
        quillRef.current.root.innerHTML = content;
      }
    },
  }));

  function handleImageUpload() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        // Step 1: Request pre-signed URL
        const { data } = await postsApi.getPresignedUrl(file.name, file.type);
        const { url, fileLink } = data;

        // Step 2: Upload to S3
        await postsApi.uploadToS3(url, file);
        toast.success('image upload successful');

        // Step 3: Insert uploaded image into Quill
        const quill = quillRef.current;
        const range = quill?.getSelection(true);

        if (range) {
          quill?.insertEmbed(range.index, 'image', fileLink);
        }

        // Track uploaded image for parent component
        uploadedImages.current.push(fileLink);
      } catch (error) {
        toast.error('failed to upload image');
        console.error('Image upload error:', error);
      }
    };
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (localEditorRef.current && !quillRef.current) {
      quillRef.current = new Quill(localEditorRef.current, {
        theme: 'snow',
        placeholder: 'Start writing your blog post...',
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: () => handleImageUpload(),
            },
          },
        },
      });
    }
    // Set initial content if provided
    if (initialContent && quillRef.current) {
      quillRef.current.root.innerHTML = initialContent;
    }
    return () => {
      // Clean up
      if (localEditorRef.current) {
        localEditorRef.current.innerHTML = '';
      }
      quillRef.current = null;
    };
  }, [initialContent]);

  return <div ref={localEditorRef} className="h-80" />;
});

Editor.displayName = 'Editor';
export default Editor;
