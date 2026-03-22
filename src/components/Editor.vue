<template>
    <editor-content :editor="editor" />
  </template>
  
  <script setup>
    import { EditorContent } from '@tiptap/vue-3'
import { useEditor } from '@/extensions/tiptap'
import { handleAppConnect } from '@/utils/bridge'


  
    const editor = useEditor({
      content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
      extensions: [StarterKit],
    })
  </script>