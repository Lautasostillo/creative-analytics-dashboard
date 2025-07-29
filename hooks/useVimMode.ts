"use client"

import { useState, useCallback, useRef } from 'react'

export type VimMode = 'normal' | 'insert' | 'visual' | 'visual-line'

export interface VimState {
  mode: VimMode
  registers: Record<string, string>
  cursor: number
  selection: { start: number; end: number } | null
  lastCommand: string
  commandBuffer: string
  yankRegister: string
}

export interface VimActions {
  setMode: (mode: VimMode) => void
  setCursor: (position: number) => void
  setSelection: (selection: { start: number; end: number } | null) => void
  yank: (text: string, register?: string) => void
  paste: (register?: string) => string
  executeCommand: (command: string) => void
  clearCommandBuffer: () => void
  appendToCommandBuffer: (char: string) => void
}

const initialState: VimState = {
  mode: 'normal',
  registers: {
    '"': '', // default register
    '0': '', // yank register
    '+': '', // system clipboard
    '*': '', // system selection
  },
  cursor: 0,
  selection: null,
  lastCommand: '',
  commandBuffer: '',
  yankRegister: '"',
}

export function useVimMode() {
  const [state, setState] = useState<VimState>(initialState)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const setMode = useCallback((mode: VimMode) => {
    setState(prev => ({
      ...prev,
      mode,
      selection: mode === 'visual' || mode === 'visual-line' ? prev.selection : null,
    }))
  }, [])

  const setCursor = useCallback((position: number) => {
    setState(prev => ({ ...prev, cursor: position }))
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(position, position)
    }
  }, [])

  const setSelection = useCallback((selection: { start: number; end: number } | null) => {
    setState(prev => ({ ...prev, selection }))
    if (textareaRef.current && selection) {
      textareaRef.current.setSelectionRange(selection.start, selection.end)
    }
  }, [])

  const yank = useCallback((text: string, register = '"') => {
    setState(prev => ({
      ...prev,
      registers: {
        ...prev.registers,
        [register]: text,
        '0': text, // Always update yank register
      },
    }))
    
    // If yanking to system clipboard
    if (register === '+' || register === '*') {
      navigator.clipboard?.writeText(text).catch(() => {
        // Fallback for browsers without clipboard API
        console.warn('Could not write to system clipboard')
      })
    }
  }, [])

  const paste = useCallback((register = '"') => {
    return state.registers[register] || ''
  }, [state.registers])

  const executeCommand = useCallback((command: string) => {
    setState(prev => ({ 
      ...prev, 
      lastCommand: command,
      commandBuffer: '',
    }))
  }, [])

  const clearCommandBuffer = useCallback(() => {
    setState(prev => ({ ...prev, commandBuffer: '' }))
  }, [])

  const appendToCommandBuffer = useCallback((char: string) => {
    setState(prev => ({ ...prev, commandBuffer: prev.commandBuffer + char }))
  }, [])

  const actions: VimActions = {
    setMode,
    setCursor,
    setSelection,
    yank,
    paste,
    executeCommand,
    clearCommandBuffer,
    appendToCommandBuffer,
  }

  return {
    state,
    actions,
    textareaRef,
  }
}