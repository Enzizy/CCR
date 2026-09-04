<template>
  <div class="min-h-screen bg-slate-200/80 p-4 md:p-8 print:p-0 print:bg-white flex flex-col items-center">
    <!-- Print Control Bar (Hidden on print) -->
    <div class="no-print w-full max-w-4xl mb-4 bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
      <button
        @click="$router.back()"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Return to System</span>
      </button>

      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500">Document ready for export</span>
        <button
          @click="triggerPrint"
          class="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-sm transition-colors"
        >
          <Printer class="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>
    </div>

    <!-- Print Container -->
    <div class="w-full">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, Printer } from 'lucide-vue-next'

function triggerPrint() {
  window.print()
}
</script>

