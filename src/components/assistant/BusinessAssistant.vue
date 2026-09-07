<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" role="presentation" @click.self="close">
      <section class="modal-panel flex max-h-[80vh] max-w-xl flex-col" role="dialog" aria-modal="true" aria-labelledby="assistant-title">
        <div class="modal-header">
          <div>
            <h2 id="assistant-title">CCR Assistant</h2>
            <p class="mt-0.5 text-[11px] font-normal text-slate-500">Ask how to use the system or understand a workflow.</p>
          </div>
          <button type="button" class="icon-button" aria-label="Close assistant" @click="close"><X class="h-4 w-4" /></button>
        </div>

        <div ref="conversation" class="min-h-48 flex-1 space-y-3 overflow-y-auto p-5 text-xs">
          <div v-if="!messages.length" class="space-y-3">
            <p class="text-slate-600">What do you need help with?</p>
            <div class="flex flex-wrap gap-2">
              <button v-for="suggestion in suggestions" :key="suggestion" type="button" class="rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-left text-brand-900 hover:bg-brand-100" @click="askSuggestion(suggestion)">{{ suggestion }}</button>
            </div>
          </div>
          <template v-for="(message, index) in messages" :key="index">
            <div class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
              <p class="max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 leading-relaxed" :class="message.role === 'user' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-800'">{{ message.text }}</p>
            </div>
          </template>
          <p v-if="loading" class="text-slate-500">Thinking…</p>
          <p v-if="error" role="alert" class="rounded-lg bg-rose-50 px-3 py-2 text-rose-700">{{ error }}</p>
        </div>

        <form class="flex gap-2 border-t border-slate-200 p-4" @submit.prevent="send">
          <input v-model.trim="draft" class="form-control" :disabled="loading" maxlength="2000" placeholder="Ask a question…" autocomplete="off">
          <button type="submit" class="primary-button shrink-0" :disabled="loading || !draft">Send</button>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'

const open = defineModel('open', { default: false })
const authStore = useAuthStore()
const messages = ref([])
const draft = ref('')
const loading = ref(false)
const error = ref('')
const conversation = ref(null)
const suggestions = ['How do I record a delivery?', 'What is an SOA?', 'How do I record a customer payment?']

watch(messages, async () => {
  await nextTick()
  conversation.value?.scrollTo({ top: conversation.value.scrollHeight, behavior: 'smooth' })
}, { deep: true })

function close() {
  open.value = false
}

function askSuggestion(suggestion) {
  draft.value = suggestion
  send()
}

async function send() {
  if (loading.value || !draft.value) return
  const question = draft.value
  messages.value.push({ role: 'user', text: question })
  draft.value = ''
  error.value = ''
  loading.value = true

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authStore.getAuthHeaders() },
      body: JSON.stringify({ messages: messages.value })
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'The assistant could not respond.')
    messages.value.push({ role: 'assistant', text: payload.text })
  } catch (requestError) {
    error.value = requestError.message || 'The assistant could not respond. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
