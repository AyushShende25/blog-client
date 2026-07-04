import type { Editor } from "@tiptap/react";
import { useCallback, useEffect, useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkIcon } from "@phosphor-icons/react";


type LinkPopoverProps = {
	editor: Editor;
	isLinkActive: boolean;
};

export function LinkPopover({ editor, isLinkActive }: LinkPopoverProps) {
	const [linkUrl, setLinkUrl] = useState("");
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (open) {
			const existingHref = editor.getAttributes("link").href as
				| string
				| undefined;
			setLinkUrl(existingHref ?? "");
		}
	}, [open, editor]);

	const applyLink = useCallback(() => {
		const trimmedUrl = linkUrl.trim();
		if (!trimmedUrl) return;

		editor
			.chain()
			.focus()
			.extendMarkRange("link")
			.setLink({ href: trimmedUrl })
			.run();

		setOpen(false);
	}, [editor, linkUrl]);

	const removeLink = useCallback(() => {
		editor.chain().focus().extendMarkRange("link").unsetLink().run();
		setLinkUrl("");
		setOpen(false);
	}, [editor]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") applyLink();
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					size="icon"
					variant="ghost"
					aria-label="Insert link"
					data-active={isLinkActive}
					className="data-[active=true]:bg-primary-foreground"
				>
					<LinkIcon />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="link-url">URL</Label>
						<Input
							id="link-url"
							placeholder="https://example.com"
							value={linkUrl}
							onChange={(e) => setLinkUrl(e.target.value)}
							onKeyDown={handleKeyDown}
							autoFocus
						/>
					</div>
					<div className="flex justify-between gap-2">
						{isLinkActive && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={removeLink}
							>
								Remove Link
							</Button>
						)}
						<Button
							type="button"
							size="sm"
							className="ml-auto"
							onClick={applyLink}
							disabled={!linkUrl.trim()}
						>
							{isLinkActive ? "Update Link" : "Add Link"}
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
