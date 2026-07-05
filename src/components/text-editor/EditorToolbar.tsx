import { type Editor, useEditorState } from "@tiptap/react";
import { menuBarStateSelector } from "./EditorState";
import {
	TextBolderIcon,
	CodeIcon,
	ArrowBendDownRightIcon,
	TextHOneIcon,
	TextHTwoIcon,
	TextHThreeIcon,
	TextItalicIcon,
	ListBulletsIcon,
	ListNumbersIcon,
	MinusIcon,
	QuotesIcon,
	ArrowClockwiseIcon,
	TextStrikethroughIcon,
	TextTIcon,
	ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import type { FormatOption } from "@/constants/types";
import { Separator } from "../ui/separator";
import { ToolbarGroup } from "./ToolbarButton";
import { LinkPopover } from "./LinkPopover";
import { ImageUploadButton } from "./ImgUploadBtn";

export function EditorToolbar({ editor }: { editor: Editor }) {
	const editorState = useEditorState({
		editor,
		selector: menuBarStateSelector,
	});

	const markOptions: FormatOption[] = [
		{
			label: "Bold",
			icon: TextBolderIcon,
			isActive: editorState.isBold,
			isDisabled: !editorState.canBold,
			onClick: () => editor.chain().focus().toggleBold().run(),
		},
		{
			label: "Italic",
			icon: TextItalicIcon,
			isActive: editorState.isItalic,
			isDisabled: !editorState.canItalic,
			onClick: () => editor.chain().focus().toggleItalic().run(),
		},
		{
			label: "Strikethrough",
			icon: TextStrikethroughIcon,
			isActive: editorState.isStrike,
			isDisabled: !editorState.canStrike,
			onClick: () => editor.chain().focus().toggleStrike().run(),
		},
		{
			label: "Inline Code",
			icon: CodeIcon,
			isActive: editorState.isCode,
			isDisabled: !editorState.canCode,
			onClick: () => editor.chain().focus().toggleCode().run(),
		},
	];

	const blockOptions: FormatOption[] = [
		{
			label: "Paragraph",
			icon: TextTIcon,
			isActive: editorState.isParagraph,
			onClick: () => editor.chain().focus().setParagraph().run(),
		},
		{
			label: "Heading 1",
			icon: TextHOneIcon,
			isActive: editorState.isHeading2,
			onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
		},
		{
			label: "Heading 2",
			icon: TextHTwoIcon,
			isActive: editorState.isHeading3,
			onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
		},
		{
			label: "Heading 3",
			icon: TextHThreeIcon,
			isActive: editorState.isHeading4,
			onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
		},
	];

	const listOptions: FormatOption[] = [
		{
			label: "Bullet List",
			icon: ListBulletsIcon,
			isActive: editorState.isBulletList,
			onClick: () => editor.chain().focus().toggleBulletList().run(),
		},
		{
			label: "Ordered List",
			icon: ListNumbersIcon,
			isActive: editorState.isOrderedList,
			onClick: () => editor.chain().focus().toggleOrderedList().run(),
		},
		{
			label: "Code Block",
			icon: CodeIcon,
			isActive: editorState.isCodeBlock,
			onClick: () => editor.chain().focus().toggleCodeBlock().run(),
		},
		{
			label: "Blockquote",
			icon: QuotesIcon,
			isActive: editorState.isBlockquote,
			onClick: () => editor.chain().focus().toggleBlockquote().run(),
		},
	];

	const utilityOptions: FormatOption[] = [
		{
			label: "Horizontal Rule",
			icon: MinusIcon,
			onClick: () => editor.chain().focus().setHorizontalRule().run(),
		},
		{
			label: "Hard Break",
			icon: ArrowBendDownRightIcon,
			onClick: () => editor.chain().focus().setHardBreak().run(),
		},
		{
			label: "Undo",
			icon: ArrowCounterClockwiseIcon,
			isDisabled: !editorState.canUndo,
			onClick: () => editor.chain().focus().undo().run(),
		},
		{
			label: "Redo",
			icon: ArrowClockwiseIcon,
			isDisabled: !editorState.canRedo,
			onClick: () => editor.chain().focus().redo().run(),
		},
	];
	return (
		<div className="rounded-md px-4 py-2 my-4 mb-8 bg-background border">
			<div className="flex flex-wrap items-center gap-1">
				<ToolbarGroup label="Format" options={markOptions} />

				<Separator orientation="vertical" className="h-6 mx-1" />

				<ToolbarGroup label="Block" options={blockOptions} />

				<Separator orientation="vertical" className="h-6 mx-1" />

				<ToolbarGroup label="Lists" options={listOptions} />

				<Separator orientation="vertical" className="h-6 mx-1" />

				<ToolbarGroup label="Tools" options={utilityOptions} />

				<Separator orientation="vertical" className="h-6 mx-1" />

				<div className="flex items-center">
					<span className="text-xs text-muted-foreground mr-1">Link:</span>
					<LinkPopover editor={editor} isLinkActive={editorState.isLink} />
				</div>

				<Separator orientation="vertical" className="h-6 mx-1" />

				<div className="flex items-center">
					<span className="text-xs text-muted-foreground mr-1">Image:</span>
					<ImageUploadButton editor={editor} />
				</div>
			</div>
		</div>
	);
}
