<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ from: '', to: '', role: '', status: '' }),
  },
  label: {
    type: String,
    default: 'Filter',
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
<<<<<<< HEAD
=======
  showRoleFilter: {
    type: Boolean,
    default: true,
  },
>>>>>>> 03b6dfa9928365d5d30f90b0bb8fedbe027d3dc5
  showStatusFilter: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'apply', 'clear']);

function updateField(key, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  });
}

function clearFilters() {
  emit('clear');
}

function applyFilters() {
  emit('apply');
}
</script>

<template>
  <div class="relative">
    <slot name="trigger" />

    <div v-show="isOpen" class="absolute left-0 top-full z-20 mt-2 flex w-90 flex-col gap-4 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <div class="flex flex-row gap-2">
        <p class="text-sm font-medium text-gray-700">Date:</p>
        <div class="flex flex-1 flex-col gap-1">
          <input :value="modelValue.from" type="date" class="rounded border border-gray-300 p-1 text-sm" @input="updateField('from', $event.target.value)" />
          <label class="text-xs text-gray-500">From</label>
        </div>
        <div class="flex flex-1 flex-col gap-1">
          <input :value="modelValue.to" type="date" class="rounded border border-gray-300 p-1 text-sm" @input="updateField('to', $event.target.value)" />
          <label class="text-xs text-gray-500">To</label>
        </div>
      </div>

<<<<<<< HEAD
      <div class="space-y-2">
=======
      <div v-if="showRoleFilter" class="space-y-2">
>>>>>>> 03b6dfa9928365d5d30f90b0bb8fedbe027d3dc5
        <p class="text-sm font-medium text-gray-700">Role</p>
        <div class="flex flex-wrap gap-3 text-sm text-gray-600">
          <label class="flex items-center gap-1">
            <input :checked="modelValue.role === ''" type="radio" value="" @change="updateField('role', $event.target.value)" />
            All
          </label>
          <label class="flex items-center gap-1">
            <input :checked="modelValue.role === 'INTTO'" type="radio" value="INTTO" @change="updateField('role', $event.target.value)" />
            INTTO
          </label>
          <label class="flex items-center gap-1">
            <input :checked="modelValue.role === 'RSO'" type="radio" value="RSO" @change="updateField('role', $event.target.value)" />
            RSO
          </label>
        </div>
      </div>

      <div v-if="showStatusFilter" class="space-y-2">
        <p class="text-sm font-medium text-gray-700">Status</p>
        <div class="flex flex-wrap gap-3 text-sm text-gray-600">
          <label class="flex items-center gap-1">
            <input :checked="modelValue.status === ''" type="radio" value="" @change="updateField('status', $event.target.value)" />
            All
          </label>
          <label class="flex items-center gap-1">
            <input :checked="modelValue.status === 'Active'" type="radio" value="Active" @change="updateField('status', $event.target.value)" />
            Active
          </label>
          <label class="flex items-center gap-1">
            <input :checked="modelValue.status === 'Inactive'" type="radio" value="Inactive" @change="updateField('status', $event.target.value)" />
            Inactive
          </label>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <button class="w-20 rounded-md bg-[#263e30] px-3 py-1 text-sm font-medium text-white transition hover:opacity-80" @click="clearFilters">
          Clear
        </button>
        <button class="w-20 rounded-md bg-[#263e30] px-3 py-1 text-sm font-medium text-white transition hover:opacity-80" @click="applyFilters">
          Apply
        </button>
      </div>
    </div>
  </div>
</template>
