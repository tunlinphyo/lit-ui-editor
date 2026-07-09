<template>
  <rich-text-editor ref="editor" />
</template>

<script setup>
import { onMounted, ref } from "vue";

const editor = ref(null);

onMounted(async () => {
  const editorElement = editor.value;
  if (!editorElement) return;

  await editorElement.updateComplete;
  await editorElement.init({ version: 1, groups: [] });

  editorElement.addEventListener("editor-change", (event) => {
    console.log(event.detail.value);
  });
});
</script>
