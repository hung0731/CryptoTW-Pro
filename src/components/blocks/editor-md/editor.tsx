"use client"

import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { EditorState, SerializedEditorState } from "lexical"
import { $convertToMarkdownString, TRANSFORMERS, $convertFromMarkdownString } from "@lexical/markdown"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect, useRef } from "react"

import { editorTheme } from "@/components/editor/themes/editor-theme"
import { TooltipProvider } from "@/components/ui/tooltip"

import { nodes } from "./nodes"
import { Plugins } from "./plugins"

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

// Helper to sync markdown
function MarkdownSync({ onChange }: { onChange: (markdown: string) => void }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const markdown = $convertToMarkdownString(TRANSFORMERS)
        onChange(markdown)
      })
    })
  }, [editor, onChange])
  return null
}

// Helper to init markdown
function MarkdownInit({ markdown }: { markdown: string }) {
  const [editor] = useLexicalComposerContext()
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current && markdown) {
      editor.update(() => {
        $convertFromMarkdownString(markdown, TRANSFORMERS)
      })
      isFirstRun.current = false
    }
  }, [editor, markdown])
  return null
}

export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  markdown,
  onMarkdownChange
}: {
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  onChange?: (editorState: EditorState) => void
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
  markdown?: string
  onMarkdownChange?: (markdown: string) => void
}) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),
        }}
      >
        <TooltipProvider>
          <Plugins />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState)
              onSerializedChange?.(editorState.toJSON())
            }}
          />

          {onMarkdownChange && <MarkdownSync onChange={onMarkdownChange} />}
          {markdown !== undefined && <MarkdownInit markdown={markdown} />}

        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}
