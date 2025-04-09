import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';

function Editor() {
  const editor = useCreateBlockNote();
  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <BlockNoteView
        className="flex-1 min-h-0 overflow-y-auto"
        theme="light"
        editor={editor}
      />
    </div>
  );
}
export default Editor;
