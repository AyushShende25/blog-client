import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  CornerDownRight,
  Type,
  Image,
  type LucideIcon,
  Link2,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { Toggle } from '@/components/ui/toggle';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type FormatOption = {
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
};

type TiptapMenuBarProps = {
  editor: Editor | null;
  onImageUpload?: (file: File) => Promise<void>;
};

function TiptapMenuBar({ editor, onImageUpload }: TiptapMenuBarProps) {
  if (!editor) {
    return null;
  }
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [linkOpen, setLinkOpen] = useState<boolean>(false);

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);

      // Reset the input so the same file can be selected again
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Exit if no URL entered
    if (!linkUrl.trim()) return;

    // Check if we need to update or create a link
    if (editor.isActive('link')) {
      // Update the existing link
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
    } else {
      // Create a new link with the selected text, or insert the URL as a link
      if (editor.state.selection.empty) {
        // No text is selected, so insert the URL as a link
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text: linkUrl,
            marks: [{ type: 'link', attrs: { href: linkUrl } }],
          })
          .run();
      } else {
        // Text is selected, so convert it to a link
        editor.chain().focus().setLink({ href: linkUrl }).run();
      }
    }

    // Reset and close
    setLinkUrl('');
    setLinkOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setLinkOpen(false);
  };

  const markOptions: FormatOption[] = [
    {
      label: 'Bold',
      icon: Bold,
      isActive: editor.isActive('bold'),
      isDisabled: !editor.can().chain().focus().toggleBold().run(),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'Italic',
      icon: Italic,
      isActive: editor.isActive('italic'),
      isDisabled: !editor.can().chain().focus().toggleItalic().run(),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: 'Strikethrough',
      icon: Strikethrough,
      isActive: editor.isActive('strike'),
      isDisabled: !editor.can().chain().focus().toggleStrike().run(),
      onClick: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      label: 'Code',
      icon: Code,
      isActive: editor.isActive('code'),
      isDisabled: !editor.can().chain().focus().toggleCode().run(),
      onClick: () => editor.chain().focus().toggleCode().run(),
    },
  ];

  // Define block options
  const blockOptions = [
    {
      label: 'Paragraph',
      icon: Type,
      isActive: editor.isActive('paragraph'),
      onClick: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: 'Heading 1',
      icon: Heading1,
      isActive: editor.isActive('heading', { level: 1 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: 'Heading 2',
      icon: Heading2,
      isActive: editor.isActive('heading', { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: 'Heading 3',
      icon: Heading3,
      isActive: editor.isActive('heading', { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
  ];

  // Define list and other block options
  const listOptions = [
    {
      label: 'Bullet List',
      icon: List,
      isActive: editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: 'Ordered List',
      icon: ListOrdered,
      isActive: editor.isActive('orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: 'Code Block',
      icon: Code,
      isActive: editor.isActive('codeBlock'),
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: 'Blockquote',
      icon: Quote,
      isActive: editor.isActive('blockquote'),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];

  // Define utility actions
  const utilityOptions = [
    {
      label: 'Horizontal Rule',
      icon: Minus,
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      label: 'Hard Break',
      icon: CornerDownRight,
      onClick: () => editor.chain().focus().setHardBreak().run(),
    },
    {
      label: 'Undo',
      icon: Undo2,
      isDisabled: !editor.can().chain().focus().undo().run(),
      onClick: () => editor.chain().focus().undo().run(),
    },
    {
      label: 'Redo',
      icon: Redo2,
      isDisabled: !editor.can().chain().focus().redo().run(),
      onClick: () => editor.chain().focus().redo().run(),
    },
  ];

  const renderToggleButtons = (options: FormatOption[]) => {
    return options.map((option) => (
      <Toggle
        key={option.label}
        aria-label={option.label}
        pressed={option.isActive}
        disabled={option.isDisabled}
        onPressedChange={option.onClick}
        className="data-[state=on]:bg-primary-foreground"
      >
        <option.icon className="h-4 w-4" />
      </Toggle>
    ));
  };

  return (
    <div className="control-group rounded-md my-2 p-2 bg-border">
      <div className="flex flex-wrap gap-2">
        {/* Format section */}
        <div className="flex gap-1 items-center">
          <span className="text-xs  mr-1">Format:</span>
          {renderToggleButtons(markOptions)}
        </div>

        {/* Block section */}
        <div className="flex gap-1 items-center">
          <span className="text-xs  mr-1">Block:</span>
          {renderToggleButtons(blockOptions)}
        </div>

        {/* List section */}
        <div className="flex gap-1 items-center">
          <span className="text-xs  mr-1">Lists:</span>
          {renderToggleButtons(listOptions)}
        </div>

        {/* Image upload section */}
        <div className="flex gap-1 items-center">
          <span className="text-xs mr-1">Media:</span>
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={handleImageInputChange}
            className="hidden"
            id="image-upload"
          />
          <Toggle
            aria-label="Insert Image"
            onPressedChange={() => imageInputRef.current?.click()}
          >
            <Image className="h-4 w-4" />
          </Toggle>
          {/* </div> */}

          {/* Link button with popover */}
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger asChild>
              <Toggle
                aria-label="Insert Link"
                pressed={editor.isActive('link')}
                onPressedChange={() => setLinkOpen(true)}
                className="data-[state=on]:bg-blue-100"
              >
                <Link2 className="h-4 w-4" />
              </Toggle>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <form onSubmit={handleLinkSubmit} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <label htmlFor="link" className="text-sm font-medium">
                    Link URL
                  </label>
                  <Input
                    id="link"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="col-span-3"
                    autoFocus
                  />
                </div>
                <div className="flex justify-between">
                  {editor.isActive('link') && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeLink}
                      size="sm"
                    >
                      Remove Link
                    </Button>
                  )}
                  <Button type="submit" size="sm" className="ml-auto">
                    {editor.isActive('link') ? 'Update Link' : 'Add Link'}
                  </Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>
        </div>
        {/* Utility section */}
        <div className="flex gap-1 items-center">
          <span className="text-xs  mr-1">Tools:</span>
          {renderToggleButtons(utilityOptions)}
        </div>
      </div>
    </div>
  );
}
export default TiptapMenuBar;
