<template>
  <IPTable :rows="rows" @add="handleAdd" @view="handleView" @edit="handleEdit" @delete="handleDelete" />
</template>

<script setup>
import { ref } from 'vue'
import IPTable from '@/components/ip/IPTable.vue'
import { ipRecords } from '@/data/ip.js'

const rows = ref([...ipRecords])

function handleAdd()       { alert('Add new IP record') }
function handleView(row)   { alert(`Viewing: ${row.title}`) }
function handleEdit(row)   { alert(`Editing: ${row.title}`) }
function handleDelete(id)  {
  if (confirm('Delete this record?')) rows.value = rows.value.filter(r => r.id !== id)
}
</script>