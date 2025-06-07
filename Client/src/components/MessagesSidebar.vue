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
            currentPage: 1,
            pollingInterval: null,
            pollTime: 2500,
            lastScrollPosition: 0,
            isUserScrolling: false,
            shouldScrollToBottom: true
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

                // Sort conversations by the most recent message in ascending order (oldest first)
                this.conversations = data.data.sort((a, b) => {
                    if (!a.ultimaMensagem || !b.ultimaMensagem) return 0;

                    // Create complete date objects for both messages
                    const dateTimeA = new Date(`${a.ultimaMensagem.DataEnvio} ${a.ultimaMensagem.HoraEnvio}`);
                    const dateTimeB = new Date(`${b.ultimaMensagem.DataEnvio} ${b.ultimaMensagem.HoraEnvio}`);

                    // Compare full datetime in milliseconds (changed to ascending order)
                    return dateTimeA.getTime() - dateTimeB.getTime();
                });
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

            // Force scroll to bottom after conversation selection
            this.$nextTick(() => {
                const container = this.$refs.messagesContainer;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });

            this.startPolling();
        },
        startPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
            }
            this.pollingInterval = setInterval(async () => {
                if (this.activeConversation && !this.isUserScrolling) {
                    await this.fetchMessages();
                }
            }, this.pollTime);
        },
        stopPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
            }
        },
        async fetchMessages() {
            try {
                const response = await fetch(`http://localhost:3000/mensagens?idRemetente=${this.currentUserId}&idDestinatario=${this.activeConversation.otherUser.id}&page=${this.currentPage}`);
                if (!response.ok) {
                    throw new Error('Erro ao carregar mensagens');
                }
                const data = await response.json();

                // Store current scroll position before updating messages
                const container = this.$refs.messagesContainer;
                const wasAtBottom = container && (container.scrollHeight - container.scrollTop - container.clientHeight < 100);
                const previousScrollTop = container?.scrollTop;

                // Store current messages state
                const currentMessages = this.messages || [];
                const newMessages = data.data.sort((a, b) => {
                    const dateA = new Date(a.DataEnvio + ' ' + a.HoraEnvio);
                    const dateB = new Date(b.DataEnvio + ' ' + b.HoraEnvio);
                    return dateA - dateB;
                });

                // Check if there are actually new messages
                const hasNewMessages = newMessages.some(newMsg =>
                    !currentMessages.find(msg => msg.IdMensagem === newMsg.IdMensagem)
                );

                // Update messages while preserving hover states
                this.messages = newMessages.map(newMsg => {
                    const existingMsg = currentMessages.find(msg => msg.IdMensagem === newMsg.IdMensagem);
                    return {
                        ...newMsg,
                        showDelete: existingMsg ? existingMsg.showDelete : false
                    };
                });

                // Handle scrolling after messages update
                this.$nextTick(() => {
                    if (container) {
                        if (!currentMessages.length) {
                            // First load - scroll to bottom
                            container.scrollTop = container.scrollHeight;
                        } else if (hasNewMessages && wasAtBottom) {
                            // New messages and was at bottom - scroll to bottom
                            container.scrollTop = container.scrollHeight;
                        } else if (!hasNewMessages && previousScrollTop) {
                            // No new messages - maintain scroll position
                            container.scrollTop = previousScrollTop;
                        }
                    }
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

                this.newMessage = '';
                await this.fetchMessages();
                await this.fetchConversations();
            } catch (err) {
                console.error('Erro ao enviar mensagem:', err);
            }
        },
        async deleteMessage(messageId) {
            try {
                const response = await fetch(`http://localhost:3000/mensagens/${messageId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Erro ao apagar mensagem');
                }

                await this.fetchMessages();
                await this.fetchConversations();
            } catch (err) {
                console.error('Erro ao apagar mensagem:', err);
            }
        },
        scrollToBottom() {
            const container = this.$refs.messagesContainer;
            if (container && !this.isUserScrolling) {
                container.scrollTop = container.scrollHeight;
            }
        },
        handleScroll(event) {
            const container = event.target;
            this.isUserScrolling = true;
            this.shouldScrollToBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

            // Reset user scrolling flag after a delay
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.isUserScrolling = false;
            }, 1000);
        },

        handleMouseEnter(message) {
            message.showDelete = true;
        },

        handleMouseLeave(message) {
            message.showDelete = false;
        },
        formatTime(time) {
            return time ? time.substring(0, 5) : '';
        },
        groupMessagesByDate(messages) {
            const groups = {};
            messages.forEach(message => {
                const date = new Date(message.DataEnvio);
                const dateKey = this.formatMessageDate(date);
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].push(message);
            });
            return groups;
        },
        formatMessageDate(date) {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (date.toDateString() === today.toDateString()) {
                return 'Hoje';
            } else if (date.toDateString() === yesterday.toDateString()) {
                return 'Ontem';
            } else {
                return date.toLocaleDateString('pt-BR');
            }
        }
    },
    created() {
        this.fetchConversations();
    },
    mounted() {
        const container = this.$refs.messagesContainer;
        if (container) {
            container.addEventListener('scroll', this.handleScroll);
        }
        window.addEventListener('open-messages', (event) => {
            this.isMessagesSidebarOpen = true;

            if (event.detail?.otherUser) {
                // Create conversation object with the other user's data
                const conversation = {
                    otherUser: event.detail.otherUser
                };
                this.selectConversation(conversation);
            }
        });
    },
    beforeDestroy() {
        const container = this.$refs.messagesContainer;
        if (container) {
            container.removeEventListener('scroll', this.handleScroll);
        }
        clearTimeout(this.scrollTimeout);
        this.stopPolling();
    },
    beforeDestroy() {
        this.stopPolling();
    },
    watch: {
        isOpen(newVal) {
            if (newVal) {
                this.fetchConversations();
            } else {
                this.stopPolling();
            }
        },
        activeConversation(newVal) {
            if (!newVal) {
                this.stopPolling();
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
                        <button class="btn btn-link p-0 me-3"
                            @click="() => { activeConversation = null; stopPolling(); }">
                            <i class="bi bi-arrow-left"></i>
                        </button>
                        <img :src="activeConversation.otherUser.imagemPerfil || 'https://via.placeholder.com/40'"
                            class="rounded-circle me-2" width="40" height="40">
                        <span class="fw-semibold">{{ activeConversation.otherUser.nome }}</span>
                    </div>
                </div>

                <!-- Replace the existing chat-messages div with this: -->
                <div class="chat-messages p-3" ref="messagesContainer" @scroll="handleScroll">
                    <template v-for="(messageGroup, date) in groupMessagesByDate(messages)" :key="date">
                        <div class="date-divider">
                            <span class="date-label">{{ date }}</span>
                        </div>
                        <div v-for="message in messageGroup" :key="message.IdMensagem" class="message-wrapper"
                            :class="{ 'message-sent': message.IdRemetente === currentUserId }"
                            @mouseenter="handleMouseEnter(message)" @mouseleave="handleMouseLeave(message)">
                            <div class="message-bubble-container">
                                <div class="message-bubble">
                                    {{ message.Conteudo }}
                                    <div class="message-time">
                                        <span>{{ formatTime(message.HoraEnvio) }}</span>
                                        <button v-if="message.IdRemetente === currentUserId" class="delete-message-btn"
                                            @click.stop="deleteMessage(message.IdMensagem)">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
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

.messages-header .messages-content {
    box-shadow: -5px 0 15px rgba(0, 0, 0, 15);
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

.message-bubble-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    max-width: 75%;
}

.message-sent .message-bubble-container {
    flex-direction: row-reverse;
}

.message-bubble {
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    background: white;
    position: relative;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    max-width: 100%;
}

.message-sent .message-bubble {
    background: #33A58C;
    color: white;
}

.delete-message-btn {
    background: rgba(220, 53, 69, 0.1);
    /* Light red background */
    border: none;
    color: #dadada;
    padding: 4px 8px;
    /* Increased padding */
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    opacity: 1;
    /* Always visible */
    visibility: visible;
    /* Always visible */
    transition: background-color 0.2s ease;
}

.delete-message-btn:hover {
    background-color: rgba(220, 53, 69, 0.2);
    /* Darker on hover */
    color: #dc3545;
}


.message-sent .delete-message-btn {
    left: -40px;
    /* Posiciona à esquerda da mensagem */
}

.message-received .delete-message-btn {
    right: -40px;
    /* Posiciona à direita da mensagem */
}

.message-bubble-container:hover .delete-message-btn {
    opacity: 1;
    visibility: visible;
}

.message-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    opacity: 0.8;
    justify-content: space-between;
    /* Changed from flex-end */
}

.date-divider {
    text-align: center;
    margin: 1rem 0;
    position: relative;
}

.date-label {
    background: #f8f9fa;
    padding: 0.25rem 1rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    color: #6c757d;
    display: inline-block;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.delete-message {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #dc3545;
    padding: 0.25rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s ease;
    display: none;
}

.message-sent .delete-message {
    left: -2rem;
}

.message-received .delete-message {
    right: -2rem;
}

.message-bubble:hover .delete-message {
    display: block;
}

.delete-message:hover {
    opacity: 1;
}

.conversation-item {
    cursor: pointer;
    transition: background-color 0.2s ease;
    padding: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.flex-grow-1.min-width-0 {
    overflow: hidden;
    width: 100%;
}

.text-truncate {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.conversation-item p {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0;
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