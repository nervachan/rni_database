<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: 'Sort',
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'update:isOpen']);

function toggleDropdown() {
  emit('update:isOpen', !props.isOpen);
}

function closeDropdown() {
  emit('update:isOpen', false);
}

function selectOption(value) {
  emit('update:modelValue', value);
  closeDropdown();
}
</script>

<template>
  <div v-click-outside="closeDropdown" class="relative">
    <button class="flex w-20 items-center justify-center rounded-md border border-gray-300 p-1 text-sm transition hover:bg-gray-300" @click.stop="toggleDropdown">
      {{ label }}
    </button>

    <div v-show="isOpen" class="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p class="mb-2 text-sm font-semibold text-gray-700">Sort by</p>
      <label v-for="option in options" :key="option.value" class="mb-2 flex items-center gap-2 text-sm last:mb-0">
        <input :checked="modelValue === option.value" type="radio" :value="option.value" @change="selectOption(option.value)" />
        {{ option.label }}
      </label>
    </div>
  </div>
</template>
