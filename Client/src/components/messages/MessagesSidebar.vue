<script>
export default {
    name: 'MessagesSidebar',
    props: {
        isOpen: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            loading: false,
            error: null,
            conversations: [],
            activeConversation: null,
            messages: [],
            newMessage: '',
            currentUserId: null,
            currentPage: 1
        }
    },
    methods: {
        async fetchConversations() {
            try {
                this.loading = true;
                const token = sessionStorage.getItem('token');
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.currentUserId = payload.IdUtilizador;

                const response = await fetch(`http://localhost:3000/mensagens/conversations/${this.currentUserId}`);
                const data = await response.json();
                this.conversations = data.data;
            } catch (err) {
                this.error = 'Erro ao carregar conversas';
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        async selectConversation(conversation) {
            this.activeConversation = conversation;
            await this.fetchMessages();
        },
        async fetchMessages() {
            try {
                const response = await fetch(`http://localhost:3000/mensagens?idRemetente=${this.currentUserId}&idDestinatario=${this.activeConversation.otherUser.id}&page=${this.currentPage}`);
                if (!response.ok) {
                    throw new Error('Erro ao carregar mensagens');
                }
                const data = await response.json();
                // Ordenar mensagens por data e hora
                this.messages = data.data.sort((a, b) => {
                    const dateA = new Date(a.DataEnvio + ' ' + a.HoraEnvio);
                    const dateB = new Date(b.DataEnvio + ' ' + b.HoraEnvio);
                    return dateA - dateB;
                });
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            } catch (err) {
                console.error('Erro ao carregar mensagens:', err);
            }
        },
        async sendMessage() {
            if (!this.newMessage.trim()) return;

            try {
                const response = await fetch('http://localhost:3000/mensagens', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        IdRemetente: this.currentUserId,
                        IdDestinatario: this.activeConversation.otherUser.id,
                        Conteudo: this.newMessage.trim()
                    })
                });

                if (!response.ok) {
                    throw new Error('Erro ao enviar mensagem');
                }

                // Limpar mensagem e atualizar chat
                this.newMessage = '';
                await this.fetchMessages();
                await this.fetchConversations(); // Atualizar lista de conversas também
            } catch (err) {
                console.error('Erro ao enviar mensagem:', err);
            }
        },
        scrollToBottom() {
            const container = this.$refs.messagesContainer;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },
        formatTime(time) {
            return time ? time.substring(0, 5) : '';
        }
    },
    created() {
        this.fetchConversations();
    },
    watch: {
        isOpen(newVal) {
            if (newVal) {
                this.fetchConversations();
            }
        }
    }
}
</script>

<template>
    <div class="messages-sidebar shadow-sm" :class="{ 'show': isOpen }">
        <div class="messages-header bg-white border-bottom p-3">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="fw-bold text-primary mb-0">Mensagens</h5>
                <button class="btn-close" @click="$emit('close')"></button>
            </div>
        </div>

        <div class="messages-content bg-light">
            <!-- Chat Messages -->
            <div v-if="activeConversation" class="chat-container">
                <div class="chat-header border-bottom p-3">
                    <div class="d-flex align-items-center">
                        <button class="btn btn-link p-0 me-3" @click="activeConversation = null">
                            <i class="bi bi-arrow-left"></i>
                        </button>
                        <img :src="activeConversation.otherUser.imagemPerfil || 'https://via.placeholder.com/40'"
                            class="rounded-circle me-2" width="40" height="40">
                        <span class="fw-semibold">{{ activeConversation.otherUser.nome }}</span>
                    </div>
                </div>

                <div class="chat-messages p-3" ref="messagesContainer">
                    <div v-for="message in messages" :key="message.IdMensagem" class="message-wrapper"
                        :class="{ 'message-sent': message.IdRemetente === currentUserId }">
                        <div class="message-bubble">
                            {{ message.Conteudo }}
                            <small class="message-time">{{ formatTime(message.HoraEnvio) }}</small>
                        </div>
                    </div>
                </div>

                <div class="chat-input border-top p-3">
                    <form @submit.prevent="sendMessage" class="d-flex gap-2">
                        <input type="text" class="form-control" v-model="newMessage"
                            placeholder="Digite sua mensagem...">
                        <button type="submit" class="btn btn-primary px-3" :disabled="!newMessage.trim()">
                            <i class="bi bi-send"></i>
                        </button>
                    </form>
                </div>
            </div>

            <!-- Conversations List -->
            <div v-else class="conversations-list">
                <div v-for="conversation in conversations" :key="conversation.otherUser.id"
                    class="conversation-item p-3 border-bottom" @click="selectConversation(conversation)">
                    <div class="d-flex align-items-center">
                        <img :src="conversation.otherUser.imagemPerfil || 'https://via.placeholder.com/40'"
                            class="rounded-circle me-3" width="40" height="40">
                        <div class="flex-grow-1 min-width-0">
                            <h6 class="mb-1 text-truncate">{{ conversation.otherUser.nome }}</h6>
                            <p class="mb-0 small text-muted text-truncate">
                                {{ conversation.ultimaMensagem.conteudo }}
                            </p>
                            <small class="text-muted">{{ conversation.ultimaMensagem.timeAgo }}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.messages-sidebar {
    position: fixed;
    top: 60px;
    right: -400px;
    width: 400px;
    height: calc(100vh - 60px);
    background: white;
    transition: right 0.3s ease;
    display: flex;
    flex-direction: column;
    z-index: 1030;
}

.messages-sidebar.show {
    right: 0;
}

.messages-content {
    flex: 1;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
}

.chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: #f8f9fa;
}

.message-wrapper {
    display: flex;
    margin-bottom: 0.5rem;
}

.message-sent {
    justify-content: flex-end;
}

.message-bubble {
    max-width: 75%;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    background: white;
    position: relative;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-sent .message-bubble {
    background: #33A58C;
    color: white;
}

.message-time {
    display: block;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    opacity: 0.8;
}

.conversation-item {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.conversation-item:hover {
    background-color: #f8f9fa;
}

.chat-input {
    background: white;
    padding: 1rem;
}

@media (max-width: 576px) {
    .messages-sidebar {
        width: 100%;
        right: -100%;
    }
}
</style>