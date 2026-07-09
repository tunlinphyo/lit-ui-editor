<template>
  <rich-text-editor ref="editor" />
</template>

<script setup>
import { onMounted, ref } from "vue";

const editor = ref(null);

onMounted(() => {
  editor.value.value = { groups: [] };
  editor.value.addEventListener("editor-change", (event) => {
    console.log(event.detail.value);
  });
});
</script>
