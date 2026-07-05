import { mediaApi, putToS3 } from "@/api/mediaApi";
import type { Editor } from "@tiptap/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CircleNotchIcon, ImageIcon } from "@phosphor-icons/react";

type ImageUploadButtonProps = {
	editor: Editor;
};

export function ImageUploadButton({ editor }: ImageUploadButtonProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = ""; // reset input
		if (!file) return;

		// immediately show image to user and then upload in background
		const blobUrl = URL.createObjectURL(file);
		editor
			.chain()
			.focus()
			.insertContent({
				type: "image",
				attrs: {
					src: blobUrl,
					alt: file.name,
					uploading: true,
					mediaId: null,
				},
			})
			.run();

		try {
			setUploading(true);
			const fileUrl = await putToS3(file, "POST");

			const { media } = await mediaApi.createMedia({
				url: fileUrl,
				mimeType: file.type,
				size: file.size,
				type: "IMAGE",
			});

			const mediaId = media.id;

			// replace the blob url inside tiptap with actual uploaded-object url
			editor.view.state.doc.descendants((node, pos) => {
				if (node.type.name === "image" && node.attrs.src === blobUrl) {
					editor.view.dispatch(
						editor.view.state.tr.setNodeMarkup(pos, undefined, {
							...node.attrs,
							src: fileUrl,
							alt: file.name,
							mediaId,
							uploading: false,
						}),
					);
				}
			});

			URL.revokeObjectURL(blobUrl);
		} catch (error) {
			// If image-upload to s3 fails then remove the temporary blob preview.
			editor.view.state.doc.descendants((node, pos) => {
				if (node.type.name === "image" && node.attrs.src === blobUrl) {
					editor.view.dispatch(
						editor.view.state.tr.delete(pos, pos + node.nodeSize),
					);
				}
			});
			URL.revokeObjectURL(blobUrl);
			console.error("Image upload failed", error);
			toast.error("Failed to upload image");
		} finally {
			setUploading(false);
		}
	};

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				accept="image/png,image/jpeg,image/webp"
				className="hidden"
				onChange={handleImageChange}
			/>
			<Button
				type="button"
				size="icon"
				variant="ghost"
				aria-label="Insert image"
				disabled={uploading}
				onClick={() => inputRef.current?.click()}
			>
				{uploading ? (
					<CircleNotchIcon size={32} className="animate-spin" />
				) : (
					<ImageIcon size={32} />
				)}
			</Button>
		</>
	);
}
