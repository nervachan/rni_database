<script setup>
import { computed } from 'vue';

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  actions: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: 'No records found',
  },
  mobileCardTitleKey: {
    type: String,
    default: 'title',
  },
  mobileCardSubtitleKey: {
    type: String,
    default: 'authors',
  },
  mobileCardMetaKeys: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['action', 'cell-action']);

const columnMap = computed(() => Object.fromEntries(props.columns.map((col) => [col.key, col])));
const statusSelectColumn = computed(() => props.columns.find((column) => column.type === 'status-select'));

function formatCell(value, column) {
  if (column?.type === 'link' && value) {
    return value;
  }

  if (column?.type === 'date' && value) {
    return value;
  }

  return value ?? '—';
}

function getColumnLabel(key) {
  return columnMap.value[key]?.label || key;
}

function handleAction(action, row) {
  emit('action', { action, row });
}

function getRowClasses(row) {
  const severity = row?.severity;
  if (severity === 'critical') return '!bg-red-100';
  if (severity === 'warning') return '!bg-yellow-100';
  return '!bg-white';
}

function getStatusClasses(value) {
  return value === 'Active'
    ? 'border-green-200 bg-green-50 text-green-700'
    : 'border-red-200 bg-red-50 text-red-700';
}
</script>

<template>
  <div>
    <div class="hidden overflow-x-auto rounded-lg bg-white p-3 shadow-[-3px_3px_6px_rgba(0,0,0,0.25)] md:block">
      <table class="min-w-full table-fixed text-sm ring-1 ring-gray-300">
        <thead class="bg-[#4d7c5e] text-left text-white">
          <tr>
            <th v-for="column in columns" :key="column.key" class="px-3 py-2 font-semibold whitespace-nowrap" :class="column.widthClass || ''">{{ column.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length" class="px-3 py-6 text-center text-gray-500">{{ emptyText }}</td>
          </tr>
          <tr v-for="(row, index) in rows" v-else :key="row.id || index" :class="[index % 2 === 0 ? 'bg-white' : 'bg-gray-200', getRowClasses(row)]">
            <td v-for="column in columns" :key="`${row.id || index}-${column.key}`" class="px-3 py-2 align-middle" :class="column.widthClass || ''">
              <template v-if="column.type === 'actions'">
                <div class="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                  <button v-for="action in actions" :key="action.key" :title="action.title" class="shrink-0 rounded border p-2 transition" :class="action.className" @click="handleAction(action, row)">
                    <component :is="action.icon" class="h-4 w-4" />
                  </button>
                </div>
              </template>
              <template v-else-if="column.type === 'link'">
                <a :href="row[column.key]" class="block truncate text-blue-600 underline hover:text-blue-800">{{ column.linkText || 'Link' }}</a>
              </template>
              <template v-else-if="column.type === 'status-select'">
                <div class="flex items-center gap-2">
                  <span class="h-2.5 w-2.5 rounded-full" :class="row[column.key] === 'Active' ? 'bg-green-500' : 'bg-red-500'" />
                  <select :value="row[column.key]" class="rounded border px-2 py-1 text-sm focus:outline-none" :class="getStatusClasses(row[column.key])" @change="emit('cell-action', { column, row, value: $event.target.value })">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </template>
              <template v-else>
                <span class="block truncate">{{ formatCell(row[column.key], column) }}</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 md:hidden">
      <div v-if="rows.length === 0" class="rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500">
        {{ emptyText }}
      </div>
      <div v-for="(row, index) in rows" v-else :key="row.id || index" class="rounded-lg border border-gray-200 p-4 shadow-sm" :class="[getRowClasses(row)]">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-gray-800">{{ row[mobileCardTitleKey] }}</p>
            <p class="truncate text-sm text-gray-600">{{ row[mobileCardSubtitleKey] }}</p>
          </div>
          <div class="flex flex-nowrap gap-2">
            <button v-for="action in actions" :key="action.key" :title="action.title" class="shrink-0 rounded border p-2 transition" :class="action.className" @click="handleAction(action, row)">
              <component :is="action.icon" class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div v-if="mobileCardMetaKeys.length" class="mt-3 space-y-1 text-sm text-gray-600">
          <div v-for="metaKey in mobileCardMetaKeys" :key="metaKey">
            <span class="font-medium text-gray-700">{{ getColumnLabel(metaKey) }}:</span> {{ formatCell(row[metaKey], columnMap[metaKey]) }}
          </div>
        </div>

        <div v-if="statusSelectColumn" class="mt-3 flex justify-end">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full" :class="row[statusSelectColumn.key] === 'Active' ? 'bg-green-500' : 'bg-red-500'" />
            <select :value="row[statusSelectColumn.key]" class="rounded border px-2 py-1 text-sm focus:outline-none" :class="getStatusClasses(row[statusSelectColumn.key])" @change="emit('cell-action', { column: statusSelectColumn, row, value: $event.target.value })">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
