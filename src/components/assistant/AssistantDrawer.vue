<template>
  <div>
    <!-- Floating Trigger Button -->
    <button
      v-if="!assistantStore.isOpen"
      @click="assistantStore.openAssistant"
      class="fixed bottom-6 right-6 z-40 bg-slate-900 text-white p-3.5 rounded-full shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 border border-slate-700 hover:scale-105"
      title="Open AI Business Assistant"
    >
      <Bot class="w-5 h-5 text-brand-400" />
      <span class="text-xs font-semibold pr-1">Ask AI Assistant</span>
    </button>

    <!-- Slide-out Drawer Container -->
    <div
      v-if="assistantStore.isOpen"
      class="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
    >
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-brand-600/30 border border-brand-400/40 flex items-center justify-center">
            <Bot class="w-4 h-4 text-brand-300" />
          </div>
          <div>
            <h2 class="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              CCR Business Assistant
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Gemini</span>
            </h2>
          </div>
        </div>

        <button
          @click="assistantStore.closeAssistant"
          class="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Suggestion Chips -->
      <div class="p-3 bg-slate-50 border-b border-slate-200 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <button
          v-for="(prompt, idx) in suggestedPrompts"
          :key="idx"
          @click="sendPreset(prompt)"
          class="shrink-0 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
        >
          {{ prompt }}
        </button>
      </div>

      <!-- Messages Area -->
      <div ref="messagesContainer" class="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        <div
          v-for="msg in assistantStore.messages"
          :key="msg.id"
          :class="[
            'flex flex-col',
            msg.role === 'user' ? 'items-end' : 'items-start'
          ]"
        >
          <div
            :class="[
              'max-w-[88%] rounded-xl px-4 py-2.5 shadow-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-brand-700 text-white rounded-br-none'
                : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none'
            ]"
          >
            <div class="whitespace-pre-line" v-html="formatMessage(msg.text)"></div>
            
            <!-- Action Confirmation Card if triggered -->
            <ActionConfirmCard
              v-if="msg.proposedAction"
              :action="msg.proposedAction"
              @confirm="assistantStore.confirmAction"
              @cancel="assistantStore.cancelAction"
            />
          </div>
          <span class="text-[10px] text-slate-400 mt-1 px-1 font-mono">{{ msg.timestamp }}</span>
        </div>

        <!-- Typing Indicator -->
        <div v-if="assistantStore.isTyping" class="flex items-center gap-1.5 text-slate-400 text-xs pl-2">
          <Loader2 class="w-3.5 h-3.5 animate-spin" />
          <span>Consulting business records...</span>
        </div>
      </div>

      <!-- Input Bar -->
      <div class="p-3 border-t border-slate-200 bg-white">
        <form @submit.prevent="handleSend" class="flex items-center gap-2">
          <input
            v-model="inputQuery"
            type="text"
            placeholder="Ask about POs, receivables, or log an expense..."
            class="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            :disabled="!inputQuery.trim() || assistantStore.isTyping"
            class="p-2 bg-brand-700 text-white rounded-lg hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send class="w-4 h-4" />
          </button>
        </form>
        <p class="text-[10px] text-slate-400 mt-1.5 text-center">
          Safety: Financial calculations are determined by app logic. Destructive actions require confirmation.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { Bot, X, Send, Loader2 } from 'lucide-vue-next'
import { useAssistantStore } from '@/stores/assistantStore'
import ActionConfirmCard from './ActionConfirmCard.vue'

const assistantStore = useAssistantStore()
const inputQuery = ref('')
const messagesContainer = ref(null)

const suggestedPrompts = [
  'How much do Cebu Landmaster Inc. owe us?',
  'What SOAs are due soon?',
  'What did we spend on gas?',
  'Record ₱2,500 gas today'
]

function sendPreset(prompt) {
  inputQuery.value = prompt
  handleSend()
}

function handleSend() {
  if (!inputQuery.value.trim()) return
  const q = inputQuery.value
  inputQuery.value = ''
  assistantStore.sendMessage(q)
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(() => assistantStore.messages.length, () => {
  scrollToBottom()
})

function formatMessage(text) {
  if (!text) return ''
  // Basic markdown bold conversion for display
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}
</script>

