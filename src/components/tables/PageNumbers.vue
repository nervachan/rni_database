<script setup>
const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})
const emit = defineEmits(['go-to-page'])

// Builds the visible page-number sequence: always the first page, the
// last page, the current page, and one neighbor on each side of it —
// everything else collapses into a single '...' entry instead of a
// button. This is the piece every one of the 5 pages that had their own
// pagination were missing: v-for="page in totalPages" rendered one
// button per page with no limit at all, so a table with 50 pages
// produced 50 buttons crammed into one row.
//
// Returns a mix of real page numbers and the string '...' (a gap, not
// clickable), so the template below can tell the two apart.
function pageNumbers(current, total) {
  const delta = 1 // how many neighbors to show on either side of current
  const pages = []
  for (let page = 1; page <= total; page++) {
    const isFirstOrLast = page === 1 || page === total
    const isNearCurrent = Math.abs(page - current) <= delta
    if (isFirstOrLast || isNearCurrent) {
      pages.push(page)
    } else if (pages[pages.length - 1] !== '...') {
      // Only push ONE '...' per gap — without this check, skipping
      // pages 4, 5, 6, 7 would push four separate '...' entries
      // instead of collapsing them into one.
      pages.push('...')
    }
  }
  return pages
}
</script>

<template>
  <template v-for="(page, index) in pageNumbers(currentPage, totalPages)" :key="index">
    <span v-if="page === '...'" class="flex h-9 min-w-[2.25rem] items-center justify-center text-sm text-gray-400">...</span>
    <button
      v-else
      class="h-9 min-w-[2.25rem] rounded-full text-sm transition"
      :class="currentPage === page ? 'bg-[#263e30] text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'"
      @click="emit('go-to-page', page)"
    >{{ page }}</button>
  </template>
</template>