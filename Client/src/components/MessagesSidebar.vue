<script>
import DenunciaModal from './DenunciaModal.vue';

export default {
    name: 'MessagesSidebar',
    components: {
        DenunciaModal
    },
    emits: ['close'],
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
            selectedUser: null,
            currentPage: 1,
            pollingInterval: null,
            pollTime: 2500,
            lastScrollPosition: 0,
            isUserScrolling: false,
            shouldScrollToBottom: true,
            isUserBlocked: false,
            isBlockedByMe: false,
            isBlockedByOther: false,
        }
    },
    methods: {
        async fetchConversations() {
            try {
                this.loading = true;
                const token = sessionStorage.getItem('token');

                if (!token) {
                    this.conversations = [];
                    this.error = null;
                    this.loading = false;
                    return;
                }

                const payload = JSON.parse(atob(token.split('.')[1]));
                this.currentUserId = payload.IdUtilizador;

                const response = await fetch(`http://localhost:3000/mensagens/conversations/${this.currentUserId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Erro ao carregar conversas');
                }

                const data = await response.json();

                if (data && data.data) { // Verificar se data e data.data existem
                    this.conversations = data.data.sort((a, b) => {
                        if (!a.ultimaMensagem || !b.ultimaMensagem) return 0;
                        const dateTimeA = new Date(`${a.ultimaMensagem.dataEnvio} ${a.ultimaMensagem.horaEnvio}`);
                        const dateTimeB = new Date(`${b.ultimaMensagem.dataEnvio} ${b.ultimaMensagem.horaEnvio}`);
                        return dateTimeB.getTime() - dateTimeA.getTime(); // Ordenar do mais recente para o mais antigo
                    });
                } else {
                    this.conversations = [];
                }

            } catch (err) {
                this.error = 'Erro ao carregar conversas';
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        selectConversation(conversation) {
            this.selectedUser = conversation.otherUser;
            this.activeConversation = conversation;
            this.messages = []; // Clear messages before loading new ones
            this.error = null;
            this.fetchMessages();
            this.checkBlockStatus();
            this.startPolling(); // Start polling when conversation is selected
        },

        closeActiveConversation() {
            this.stopPolling(); // Stop polling when conversation is closed
            this.activeConversation = null;
            this.selectedUser = null;
            this.messages = [];
            this.error = null;
            this.fetchConversations();
        },
        async startPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
            }

            this.pollingInterval = setInterval(async () => {
                if (this.activeConversation && !this.isUserScrolling) {
                    try {
                        const container = this.$refs.messagesContainer;
                        const currentScroll = container ? container.scrollTop : 0;
                        const scrollHeight = container ? container.scrollHeight : 0;
                        const isAtBottom = container ?
                            (container.scrollHeight - container.scrollTop - container.clientHeight < 100) :
                            false;

                        // Fetch new messages without changing loading state
                        const token = sessionStorage.getItem('token');
                        const response = await fetch(
                            `http://localhost:3000/mensagens?idRemetente=${this.currentUserId}&idDestinatario=${this.activeConversation.otherUser.id}&page=${this.currentPage}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            }
                        );

                        if (response.ok) {
                            const data = await response.json();
                            const newMessages = data.data;

                            // Only update if there are actual changes
                            if (JSON.stringify(newMessages) !== JSON.stringify(this.messages)) {
                                this.messages = newMessages;

                                // Maintain scroll position after update
                                this.$nextTick(() => {
                                    if (container) {
                                        if (isAtBottom) {
                                            container.scrollTop = container.scrollHeight;
                                        } else {
                                            // Calculate and maintain relative scroll position
                                            const newScrollHeight = container.scrollHeight;
                                            const scrollDiff = newScrollHeight - scrollHeight;
                                            container.scrollTop = currentScroll + scrollDiff;
                                        }
                                    }
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Erro no polling:', error);
                    }
                }
            }, 3000);
        },
        stopPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
            }
        },
        async fetchMessages() {
            try {
                if (!this.activeConversation?.otherUser?.id) {
                    return;
                }

                const token = sessionStorage.getItem('token');
                if (!token) {
                    this.error = 'Autenticação necessária';
                    return;
                }

                // Verificar bloqueio primeiro antes de tentar buscar mensagens
                await this.checkBlockStatus();

                if (this.isUserBlocked) {
                    this.messages = [];
                    this.error = 'Não é possível ver mensagens de utilizadores bloqueados';
                    return;
                }

                const response = await fetch(
                    `http://localhost:3000/mensagens?idRemetente=${this.currentUserId}&idDestinatario=${this.activeConversation.otherUser.id}&page=${this.currentPage}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 403) {
                        this.isUserBlocked = true;
                        this.messages = [];
                        this.error = data.message || 'Não é possível ver ou enviar mensagens de utilizadores bloqueados';
                        return;
                    }
                    throw new Error(data.message || 'Erro ao carregar mensagens');
                }

                this.messages = data.data;
                this.error = null;

                if (this.shouldScrollToBottom) {
                    this.$nextTick(this.scrollToBottom);
                }
            } catch (error) {
                console.error('Erro ao buscar mensagens:', error);
                this.error = error.message;
                this.messages = [];
            }
        },
        async sendMessage() {
            try {
                if (!this.newMessage.trim() || !this.activeConversation?.otherUser?.id) {
                    return;
                }

                const container = this.$refs.messagesContainer;
                const isAtBottom = container ?
                    (container.scrollHeight - container.scrollTop - container.clientHeight < 100) :
                    false;

                const token = sessionStorage.getItem('token');
                if (!token) {
                    this.error = 'Autenticação necessária';
                    return;
                }

                const response = await fetch('http://localhost:3000/mensagens', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        IdRemetente: this.currentUserId,
                        IdDestinatario: this.activeConversation.otherUser.id,
                        Conteudo: this.newMessage.trim()
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 403) {
                        this.error = 'Não é possível enviar mensagens para utilizadores bloqueados';
                        return;
                    }
                    throw new Error(errorData.message || 'Erro ao enviar mensagem');
                }

                this.newMessage = '';
                this.error = null;
                await this.fetchMessages();
                await this.fetchConversations();

                // Scroll to bottom only if was at bottom before sending
                if (isAtBottom) {
                    this.$nextTick(() => {
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                    });
                }
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
                this.error = error.message;
            }
        },
        handleDenunciaEnviada() {
            alert('Denúncia enviada com sucesso!');
            this.$refs.denunciaModal?.hideModal();
        },
        async deleteMessage(messageId) {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    throw new Error('Autenticação necessária');
                }

                // Save scroll position before deletion
                const container = this.$refs.messagesContainer;
                const currentScroll = container ? container.scrollTop : 0;
                const scrollHeight = container ? container.scrollHeight : 0;
                const isAtBottom = container ?
                    (container.scrollHeight - container.scrollTop - container.clientHeight < 100) :
                    false;

                const response = await fetch(`http://localhost:3000/mensagens/${messageId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Erro ao apagar mensagem');
                }

                // Remove message from local state
                this.messages = this.messages.filter(m => m.IdMensagem !== messageId);

                // Update conversations list
                await this.fetchConversations();

                // Restore scroll position after deletion
                this.$nextTick(() => {
                    if (container) {
                        if (isAtBottom) {
                            container.scrollTop = container.scrollHeight;
                        } else {
                            // Calculate and maintain relative scroll position
                            const newScrollHeight = container.scrollHeight;
                            const scrollDiff = newScrollHeight - scrollHeight;
                            container.scrollTop = currentScroll + scrollDiff;
                        }
                    }
                });
            } catch (err) {
                console.error('Erro ao apagar mensagem:', err);
                alert(err.message || 'Erro ao apagar mensagem');
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
        },
        async checkBlockStatus() {
            try {
                const token = sessionStorage.getItem('token');
                if (!token || !this.activeConversation?.otherUser?.id) return;

                const payload = JSON.parse(atob(token.split('.')[1]));

                // Verificar bloqueio em ambas as direções
                const [response1, response2] = await Promise.all([
                    fetch(`http://localhost:3000/bloqueios/utilizador/check?idBloqueador=${payload.IdUtilizador}&idBloqueado=${this.activeConversation.otherUser.id}`),
                    fetch(`http://localhost:3000/bloqueios/utilizador/check?idBloqueador=${this.activeConversation.otherUser.id}&idBloqueado=${payload.IdUtilizador}`)
                ]);

                if (!response1.ok || !response2.ok) {
                    throw new Error('Erro ao verificar status de bloqueio');
                }

                const [data1, data2] = await Promise.all([
                    response1.json(),
                    response2.json()
                ]);

                this.isBlockedByMe = data1.bloqueado;
                this.isBlockedByOther = data2.bloqueado;
                this.isUserBlocked = this.isBlockedByMe || this.isBlockedByOther;

                if (this.isUserBlocked) {
                    this.messages = [];
                    this.error = this.isBlockedByOther
                        ? 'Você foi bloqueado por este utilizador'
                        : 'Não é possível ver mensagens de utilizadores bloqueados';
                } else {
                    this.error = null;
                }
            } catch (error) {
                console.error('Erro ao verificar status de bloqueio:', error);
                this.error = 'Erro ao verificar status de bloqueio';
            }
        },
        handleReport() {
            this.$refs.denunciaModal.showModal();
        },
        async handleBlock() {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    this.$router.push('/login');
                    return;
                }

                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentUserId = payload.IdUtilizador;

                
                if (this.isBlockedByMe) {
                    const checkResponse = await fetch(`http://localhost:3000/bloqueios/utilizador/check?idBloqueador=${currentUserId}&idBloqueado=${this.selectedUser.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!checkResponse.ok) {
                        throw new Error('Erro ao verificar o estado do bloqueio antes de desbloquear.');
                    }
                    
                    const blockData = await checkResponse.json();
                    if (!blockData.bloqueado || !blockData.data?.IdUtilizadoresBloqueados) {
                        throw new Error('Não foi possível encontrar o bloqueio para remover.');
                    }

                    // Unblock the user using the retrieved block ID
                    const deleteResponse = await fetch(`http://localhost:3000/bloqueios/utilizador/${blockData.data.IdUtilizadoresBloqueados}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!deleteResponse.ok) {
                        throw new Error('Erro ao desbloquear utilizador');
                    }
                } else {
                    // Block the user
                    const createResponse = await fetch('http://localhost:3000/bloqueios/utilizador', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            IdBloqueador: currentUserId,
                            IdBloqueado: this.selectedUser.id
                        })
                    });

                    if (!createResponse.ok) {
                        const errorData = await createResponse.json();
                        throw new Error(errorData.message || 'Erro ao bloquear utilizador');
                    }
                }

                // After the operation, refresh the block status and messages
                await this.checkBlockStatus();
                if (!this.isUserBlocked) {
                    await this.fetchMessages();
                }

            } catch (error) {
                console.error('Erro ao bloquear/desbloquear:', error);
                alert(error.message);
            }
        }
    },

    created() {
        // Only fetch conversations if user is logged in
        const token = sessionStorage.getItem('token');
        if (token) {
            this.fetchConversations();
        }
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
        activeConversation: {
            handler(newVal) {
                if (newVal) {
                    this.startPolling();
                    this.fetchMessages();
                } else {
                    this.stopPolling();
                }
            },
            immediate: true
        },
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
        },
        selectedUser: {
            immediate: true,
            handler() {
                if (this.selectedUser) {
                    this.checkBlockStatus();
                }
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
                <div class="chat-header border-bottom p-3" v-if="selectedUser">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-link text-dark p-0 me-2" @click="closeActiveConversation">
                                <i class="bi bi-arrow-left fs-5"></i>
                            </button>
                            <img :src="selectedUser.imagemPerfil" alt="User" class="rounded-circle" width="40"
                                height="40">
                            <div>
                                <h6 class="mb-0">{{ selectedUser.nome }}</h6>
                            </div>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-link text-dark p-0" data-bs-toggle="dropdown">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <button class="dropdown-item text-danger" @click="handleReport">
                                        <i class="bi bi-flag me-2"></i>
                                        Denunciar
                                    </button>
                                </li>
                                <li>
                                <li v-if="!isBlockedByOther">
                                    <button class="dropdown-item" @click="handleBlock">
                                        <i class="bi"
                                            :class="isBlockedByMe ? 'bi-unlock me-2' : 'bi-slash-circle me-2'"></i>
                                        {{ isBlockedByMe ? 'Desbloquear' : 'Bloquear' }}
                                    </button>
                                </li>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Messages Area -->
                <div class="chat-messages p-3" ref="messagesContainer" @scroll="handleScroll">
                    <!-- Mensagem de bloqueio -->
                    <div v-if="isUserBlocked" class="alert alert-warning text-center my-3">
                        <i class="bi bi-slash-circle me-2"></i>
                        Não é possível ver ou enviar mensagens de utilizadores bloqueados
                    </div>

                    <!-- Error Message -->
                    <div v-else-if="error" class="alert alert-danger text-center my-3">
                        {{ error }}
                    </div>

                    <!-- Loading Message -->
                    <div v-else-if="loading" class="text-center my-3">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Carregando...</span>
                        </div>
                    </div>

                    <!-- Normal Messages -->
                    <template v-else v-for="(messageGroup, date) in groupMessagesByDate(messages)" :key="date">
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

                <!-- Message Input -->
                <div class="chat-input border-top p-3">
                    <form @submit.prevent="sendMessage" class="d-flex gap-2">
                        <input type="text" v-model="newMessage" :disabled="isUserBlocked"
                            :placeholder="isUserBlocked ? 'Não é possível enviar mensagens para utilizadores bloqueados' : 'Escreva uma mensagem...'"
                            class="form-control">
                        <button type="submit" class="btn btn-primary px-3"
                            :disabled="isUserBlocked || !newMessage.trim()">
                            <i class="bi bi-send"></i>
                        </button>
                    </form>
                </div>
            </div>

            <!-- Conversations List -->
            <div v-else class="conversations-list">
                <div v-if="error" class="alert alert-danger m-3">
                    {{ error }}
                </div>
                <div v-else-if="loading" class="text-center p-3">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </div>
                <div v-else-if="conversations.length === 0" class="text-center p-3 text-muted">
                    Nenhuma conversa encontrada
                </div>
                <div v-else v-for="conversation in conversations" :key="conversation.otherUser.id"
                    class="conversation-item p-3 border-bottom" @click="selectConversation(conversation)">
                    <div class="d-flex align-items-center">
                        <img :src="conversation.otherUser.imagemPerfil || 'https://via.placeholder.com/40'"
                            class="rounded-circle me-3" width="40" height="40">
                        <div class="flex-grow-1 min-width-0">
                            <h6 class="mb-1 text-truncate">{{ conversation.otherUser.nome }}</h6>
                            <p v-if="conversation.ultimaMensagem" class="mb-0 small text-muted text-truncate">
                                {{ conversation.ultimaMensagem.conteudo }}
                            </p>
                            <small v-if="conversation.ultimaMensagem" class="text-muted">
                                {{ conversation.ultimaMensagem.timeAgo }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Denúncia Modal -->
    <DenunciaModal v-if="selectedUser" ref="denunciaModal" :idDenunciado="selectedUser.id"
        :utilizadorDenunciado="selectedUser.nome" tipo="Utilizador" @denuncia-enviada="handleDenunciaEnviada" />
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