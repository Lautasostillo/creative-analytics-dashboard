"use client"

import React, { useEffect, useCallback, useState } from 'react'
import { useVimMode, VimMode } from '@/hooks/useVimMode'
import { cn } from '@/lib/utils'

interface VimEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

export function VimEditor({ 
  value, 
  onChange, 
  placeholder = "Enter text...", 
  className,
  rows = 4 
}: VimEditorProps) {
  const { state, actions, textareaRef } = useVimMode()
  const [internalValue, setInternalValue] = useState(value)

  // Sync internal value with external value
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  // Handle text changes
  const handleChange = useCallback((newValue: string) => {
    setInternalValue(newValue)
    onChange(newValue)
  }, [onChange])

  // Get cursor position in text
  const getCursorPosition = useCallback(() => {
    return textareaRef.current?.selectionStart || 0
  }, [])

  // Set cursor position in text
  const setCursorPosition = useCallback((position: number) => {
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(position, position)
      actions.setCursor(position)
    }
  }, [actions])

  // Motion commands
  const moveWordForward = useCallback((pos: number) => {
    const match = internalValue.slice(pos).match(/\s*\S+/)
    return match ? pos + match[0].length : internalValue.length
  }, [internalValue])

  const moveWordBackward = useCallback((pos: number) => {
    const beforeCursor = internalValue.slice(0, pos)
    const match = beforeCursor.match(/\S+\s*$/)
    return match ? pos - match[0].length : 0
  }, [internalValue])

  const moveToLineEnd = useCallback((pos: number) => {
    const lineEnd = internalValue.indexOf('\n', pos)
    return lineEnd === -1 ? internalValue.length : lineEnd
  }, [internalValue])

  const moveToLineStart = useCallback((pos: number) => {
    return internalValue.lastIndexOf('\n', pos - 1) + 1
  }, [internalValue])

  // Yank with motion
  const yankWithMotion = useCallback((motion: string, fromPos: number) => {
    let endPos = fromPos
    
    switch (motion) {
      case 'w':
        endPos = moveWordForward(fromPos)
        break
      case 'b':
        endPos = moveWordBackward(fromPos)
        break
      case 'e':
        endPos = moveWordForward(fromPos) - 1
        break
      case '$':
        endPos = moveToLineEnd(fromPos)
        break
      case '0':
        endPos = moveToLineStart(fromPos)
        break
    }
    
    const start = Math.min(fromPos, endPos)
    const end = Math.max(fromPos, endPos)
    const text = internalValue.slice(start, end)
    actions.yank(text)
    actions.clearCommandBuffer()
  }, [internalValue, actions, moveWordForward, moveWordBackward, moveToLineEnd, moveToLineStart])

  // Handle vim commands
  const handleVimCommand = useCallback((key: string, shiftKey: boolean, ctrlKey: boolean) => {
    const currentPos = getCursorPosition()
    
    switch (state.mode) {
      case 'normal':
        // Handle motion commands
        switch (key) {
          case 'h':
            setCursorPosition(Math.max(0, currentPos - 1))
            return
          case 'j':
            const nextLineStart = internalValue.indexOf('\n', currentPos)
            if (nextLineStart !== -1) {
              const currentLineStart = internalValue.lastIndexOf('\n', currentPos - 1) + 1
              const columnPos = currentPos - currentLineStart
              const nextNextLineStart = internalValue.indexOf('\n', nextLineStart + 1)
              const nextLineEnd = nextNextLineStart === -1 ? internalValue.length : nextNextLineStart
              const newPos = Math.min(nextLineStart + 1 + columnPos, nextLineEnd)
              setCursorPosition(newPos)
            }
            return
          case 'k':
            const currentLineStart = internalValue.lastIndexOf('\n', currentPos - 1) + 1
            if (currentLineStart > 0) {
              const prevLineStart = internalValue.lastIndexOf('\n', currentLineStart - 2) + 1
              const columnPos = currentPos - currentLineStart
              const newPos = Math.min(prevLineStart + columnPos, currentLineStart - 1)
              setCursorPosition(newPos)
            }
            return
          case 'l':
            setCursorPosition(Math.min(internalValue.length, currentPos + 1))
            return
          case 'w':
            if (state.commandBuffer === 'y') {
              yankWithMotion('w', currentPos)
              return
            }
            setCursorPosition(moveWordForward(currentPos))
            return
          case 'b':
            if (state.commandBuffer === 'y') {
              yankWithMotion('b', currentPos)
              return
            }
            setCursorPosition(moveWordBackward(currentPos))
            return
          case 'e':
            if (state.commandBuffer === 'y') {
              yankWithMotion('e', currentPos)
              return
            }
            setCursorPosition(moveWordForward(currentPos) - 1)
            return
          case '$':
            if (state.commandBuffer === 'y') {
              yankWithMotion('$', currentPos)
              return
            }
            setCursorPosition(moveToLineEnd(currentPos))
            return
          case '0':
            if (state.commandBuffer === 'y') {
              yankWithMotion('0', currentPos)
              return
            }
            setCursorPosition(moveToLineStart(currentPos))
            return
        }

        switch (key) {
          case 'i':
            actions.setMode('insert')
            break
          case 'I':
            // Insert at beginning of line
            const lineStart = moveToLineStart(currentPos)
            setCursorPosition(lineStart)
            actions.setMode('insert')
            break
          case 'a':
            setCursorPosition(Math.min(internalValue.length, currentPos + 1))
            actions.setMode('insert')
            break
          case 'A':
            // Append at end of line
            setCursorPosition(moveToLineEnd(currentPos))
            actions.setMode('insert')
            break
          case 'o':
            // Open new line below
            const nextLinePos = internalValue.indexOf('\n', currentPos)
            const insertPos = nextLinePos === -1 ? internalValue.length : nextLinePos
            handleChange(internalValue.slice(0, insertPos) + '\n' + internalValue.slice(insertPos))
            setCursorPosition(insertPos + 1)
            actions.setMode('insert')
            break
          case 'O':
            // Open new line above
            const prevLinePos = moveToLineStart(currentPos)
            handleChange(internalValue.slice(0, prevLinePos) + '\n' + internalValue.slice(prevLinePos))
            setCursorPosition(prevLinePos)
            actions.setMode('insert')
            break
          case 'v':
            actions.setMode('visual')
            actions.setSelection({ start: currentPos, end: currentPos })
            break
          case 'V':
            actions.setMode('visual-line')
            const lineStartPos = moveToLineStart(currentPos)
            const lineEndPos = moveToLineEnd(currentPos)
            actions.setSelection({ 
              start: lineStartPos, 
              end: lineEndPos
            })
            break
          case 'y':
            // Start yank command
            actions.appendToCommandBuffer('y')
            break
          case 'p':
            // Paste after cursor
            const pasteText = actions.paste()
            if (pasteText) {
              const insertAtPos = pasteText.includes('\n') ? moveToLineEnd(currentPos) : currentPos + 1
              handleChange(internalValue.slice(0, insertAtPos) + pasteText + internalValue.slice(insertAtPos))
              setCursorPosition(insertAtPos + pasteText.length - 1)
            }
            break
          case 'P':
            // Paste before cursor
            const pasteTextBefore = actions.paste()
            if (pasteTextBefore) {
              const insertAtPos = pasteTextBefore.includes('\n') ? moveToLineStart(currentPos) : currentPos
              handleChange(internalValue.slice(0, insertAtPos) + pasteTextBefore + internalValue.slice(insertAtPos))
              setCursorPosition(insertAtPos)
            }
            break
        }
        break
      
      case 'insert':
        if (key === 'Escape') {
          actions.setMode('normal')
          setCursorPosition(Math.max(0, currentPos - 1))
        }
        break
      
      case 'visual':
      case 'visual-line':
        switch (key) {
          case 'Escape':
            actions.setMode('normal')
            actions.setSelection(null)
            break
          case 'y':
            // Yank selection
            if (state.selection) {
              const selectedText = internalValue.slice(state.selection.start, state.selection.end)
              actions.yank(selectedText)
              actions.setMode('normal')
              actions.setSelection(null)
            }
            break
          case 'd':
            // Delete selection
            if (state.selection) {
              const newValue = internalValue.slice(0, state.selection.start) + internalValue.slice(state.selection.end)
              handleChange(newValue)
              setCursorPosition(state.selection.start)
              actions.setMode('normal')
              actions.setSelection(null)
            }
            break
        }
        break
    }

    // Handle yank commands in command buffer
    if (state.commandBuffer === 'y' && key === 'y') {
      // yy - yank current line
      const lineStart = internalValue.lastIndexOf('\n', currentPos - 1) + 1
      const lineEnd = internalValue.indexOf('\n', currentPos)
      const lineText = internalValue.slice(lineStart, lineEnd === -1 ? internalValue.length : lineEnd + 1)
      actions.yank(lineText)
      actions.clearCommandBuffer()
    }
  }, [state, actions, internalValue, getCursorPosition, setCursorPosition, handleChange])

  // Handle keydown events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Let normal typing through in insert mode
    if (state.mode === 'insert' && !['Escape'].includes(e.key)) {
      return
    }

    // Handle vim commands
    if (state.mode !== 'insert' || e.key === 'Escape') {
      e.preventDefault()
      handleVimCommand(e.key, e.shiftKey, e.ctrlKey)
    }
  }, [state.mode, handleVimCommand])

  // Handle input changes in insert mode
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (state.mode === 'insert') {
      handleChange(e.target.value)
    }
  }, [state.mode, handleChange])

  // Mode indicator styles
  const getModeStyles = () => {
    switch (state.mode) {
      case 'insert':
        return 'border-green-500 ring-green-500'
      case 'visual':
      case 'visual-line':
        return 'border-blue-500 ring-blue-500'
      case 'normal':
      default:
        return 'border-yellow-500 ring-yellow-500'
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={internalValue}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          getModeStyles(),
          className
        )}
      />
      
      {/* Mode indicator */}
      <div className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-background/80 border">
        {state.mode.toUpperCase()}
        {state.commandBuffer && (
          <span className="ml-1 text-muted-foreground">:{state.commandBuffer}</span>
        )}
      </div>
    </div>
  )
}