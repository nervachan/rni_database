from pathlib import Path

path = Path('src/views/intto-pages/ipManagement.vue')
text = path.read_text(encoding='utf-8')
start = '<!-- Inline add/edit form -->'
end = '<!-- Table -->'
idx = text.find(start)
if idx == -1:
    raise SystemExit('start marker not found')
idx2 = text.find(end, idx)
if idx2 == -1:
    raise SystemExit('end marker not found')
new = '''    <!-- Record modal -->
    <transition name="slide-form">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8" @click.self="cancelForm">
        <div class="w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-widest text-black mb-1">{{ editingId ? 'Edit Record' : 'New Record' }}</p>
              <p class="text-sm text-slate-500">Use this form to save IP filing details.</p>
            </div>
            <button @click="cancelForm" class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-black transition">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[10px] text-black/40 uppercase tracking-wider">Title</label>
                <input v-model="form.title" class="bg-gray-100 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]" placeholder="IP title" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[10px] text-black/40 uppercase tracking-wider">Filing Date</label>
                <input v-model="form.filingDate" type="date" class="bg-gray-100 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[10px] text-black/40 uppercase tracking-wider">Inventors</label>
                <input v-model="form.inventors" class="bg-gray-100 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]" placeholder="e.g. Juan Dela Cruz, Maria Santos" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[10px] text-black/40 uppercase tracking-wider">Classification</label>
                <select v-model="form.classification" class="bg-gray-100 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]">
                  <option value="">Select...</option>
                  <option>Patent</option>
                  <option>Trademark</option>
                  <option>Copyright</option>
                  <option>Industrial Design</option>
                  <option>Trade secret</option>
                  <option>Utility model</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[10px] text-black/40 uppercase tracking-wider">Status</label>
                <select v-model="form.status" class="bg-gray-100 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-black outline-none focus:border-[#263e30]">
                  <option value="">Select...</option>
                  <option>Pending</option>
                  <option>Granted</option>
                  <option>Licensed</option>
                  <option>Abandoned</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="cancelForm" class="rounded-2xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">
                Cancel
              </button>
              <button type="submit" class="rounded-2xl bg-[#263e30] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4d7c5e] transition">
                {{ editingId ? 'Save changes' : 'Add record' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Table -->'''

path.write_text(text[:idx] + new + text[idx2:], encoding='utf-8')
print('updated')
