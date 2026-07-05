import { XIcon } from "@phosphor-icons/react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

function ImageNodeView({ node, deleteNode }: NodeViewProps) {
	return (
		<NodeViewWrapper>
			<div className={cn("relative inline-block")}>
				<img
					src={node.attrs.src}
					alt={node.attrs.alt ?? ""}
					className="max-w-full"
				/>

				<Button
					type="button"
					size="icon-sm"
					variant="destructive"
					className="absolute right-0 top-8 size-6 cursor-pointer"
					onClick={deleteNode}
					contentEditable={false}
					aria-label="Remove image"
				>
					<XIcon />
				</Button>

				{node.attrs.uploading && (
					<div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/60">
						<span className="text-sm text-muted-foreground">Uploading...</span>
					</div>
				)}
			</div>
		</NodeViewWrapper>
	);
}
export default ImageNodeView;

// The X btn allows us to remove image node from editor, it DOES NOT immediately delete S3 object this allows for undo action.
