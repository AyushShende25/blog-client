import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { EditorToolbar } from "./EditorToolbar";
import { CustomImage } from "./CustomImage";

type TextEditorProps = {
	value?: string;
	onChange?: (html: string) => void;
};

function TextEditor({ value, onChange }: TextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Link.configure({
				openOnClick: false,
				autolink: true,
			}),
			CustomImage,
		],
		editorProps: {
			attributes: {
				class:
					"prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-none min-h-96 px-1",
			},
		},
		content: value,
		onUpdate: ({ editor }) => {
			onChange?.(editor.getHTML());
		},
		immediatelyRender: false,
	});

	if (!editor) {
		return null;
	}
	return (
		<>
			<EditorToolbar editor={editor} />
			<EditorContent editor={editor} />
		</>
	);
}
export default TextEditor;

// data flow
// post.content => TanStack Form field => value (value={field.state.value}) => Tiptap content (content: value)

// data changes
// User types => Tiptap document changes => onUpdate => editor.getHTML() => onChange(html) => field.handleChange(html) => TanStack Form content updated

// Image flow
// Select cat.png => Create blob URL => <img src="blob:abc" /> => Tiptap onUpdate => form.content temporarily has blob URL => Upload to S3 => fileUrl received => Find image with src="blob:abc" => Replace src with S3 URL => <img src="https://s3.../cat.png" /> => Tiptap onUpdate => form.content now has permanent URL

// Earlier we used mediaIdsRef and onImageUpload, that worked because we did not had remove-image functionality so uploadedImages=mediaIds but after adding remove-image functionality, even after removing an image the mediaIdsRef would have that removed-image-id, hence now we scrape the mediaIds from the html-content and got rid of refs and onImageUpload
