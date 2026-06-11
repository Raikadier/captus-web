import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { aiTaskService } from '../../services/aiTaskService';
import { aiEventsService } from '../../services/aiEventsService';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  Send, Sparkles, User, Plus, Menu, CheckCircle,
  MessageSquare, ChevronLeft,
} from 'lucide-react';
import MarkdownContent from '../../components/MarkdownContent';

const ChatBotPage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(max-width: 767px)').matches;
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await aiTaskService.getConversations();
      // #region agent log
      fetch('http://127.0.0.1:7697/ingest/9edb4587-8b39-4b9a-916c-9f808f5e6cc5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'98b83a'},body:JSON.stringify({sessionId:'98b83a',location:'ChatBotPage:fetchConversations',message:'conversations loaded',data:{count:Array.isArray(data)?data.length:0,isArray:Array.isArray(data)},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7697/ingest/9edb4587-8b39-4b9a-916c-9f808f5e6cc5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'98b83a'},body:JSON.stringify({sessionId:'98b83a',location:'ChatBotPage:fetchConversations:catch',message:'conversations fetch failed',data:{status:err.response?.status,apiMessage:err.response?.data?.error?.message},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const data = await aiTaskService.getMessages(conversationId);
      setMessages(data.map(msg => ({
        id: msg.id,
        type: msg.role === 'assistant' || msg.role === 'bot' ? 'bot' : 'user',
        content: msg.content,
        timestamp: new Date(msg.createdAt ?? msg.created_at),
      })));
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!user) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, type: 'bot',
        content: 'Error: No se ha identificado al usuario. Por favor inicia sesión nuevamente.',
        timestamp: new Date(),
      }]);
      return;
    }

    const userMessage = {
      id: 'temp-user-' + Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const responseData = await aiEventsService.sendMessage(
        userMessage.content, activeConversation
      );

      if (!activeConversation && responseData.conversationId) {
        setActiveConversation(String(responseData.conversationId));
      }

      if (responseData.actionPerformed) {
        const action = responseData.actionPerformed;
        const eventName = action.includes('task') ? 'task-update'
          : action.includes('event') ? 'event-update'
          : action.includes('note') ? 'note-update' : null;
        if (eventName) {
          window.dispatchEvent(new CustomEvent(eventName, { detail: { action } }));
        }
      }

      setMessages(prev => [...prev, {
        id: 'temp-bot-' + Date.now(),
        type: 'bot',
        content: responseData.result,
        timestamp: new Date(),
        action: responseData.actionPerformed,
      }]);
    } catch (err) {
      console.error('Error sending message:', err);
      // #region agent log
      fetch('http://127.0.0.1:7697/ingest/9edb4587-8b39-4b9a-916c-9f808f5e6cc5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'98b83a'},body:JSON.stringify({sessionId:'98b83a',location:'ChatBotPage:handleSendMessage:catch',message:'AI chat failed',data:{status:err.response?.status,apiError:err.response?.data?.error?.message||err.response?.data?.message},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const apiMsg = err.response?.data?.error?.message || err.response?.data?.message;
      setMessages(prev => [...prev, {
        id: Date.now() + 1, type: 'bot',
        content: apiMsg
          ? `Error: ${apiMsg}`
          : 'Lo siento, hubo un error al procesar tu mensaje. Intenta de nuevo.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      fetchConversations();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = () => {
    setActiveConversation(null);
    setMessages([{
      id: Date.now(),
      type: 'bot',
      content: '¡Hola! Soy Captus AI, tu asistente personal de productividad académica. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    }]);
  };

  const hasConversation = activeConversation !== null || messages.length > 0;
  const conversationList = Array.isArray(conversations) ? conversations : [];

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground">

      {/* Sidebar: estructura de 2 bloques (como main en prod) + min-h-0 para que la lista no colapse */}
      <AnimatePresence>
        {showSidebar && (
          <Motion.div
            aria-label="Historial de conversaciones"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0 flex flex-col overflow-hidden bg-card border-r border-border"
            style={{ minHeight: 0 }}
          >
            <div className="shrink-0 border-b border-border">
              <div className="p-3 flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <span className="font-semibold text-foreground text-sm">Captus AI</span>
                <button
                  type="button"
                  onClick={() => setShowSidebar(false)}
                  aria-label="Ocultar panel de conversaciones"
                  className="ml-auto p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
              <div className="px-3 pb-3">
                <button
                  type="button"
                  onClick={handleNewConversation}
                  aria-label="Iniciar nueva conversación con Captus AI"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all text-sm font-medium shadow-brand-sm"
                >
                  <Plus size={16} aria-hidden="true" />
                  Nueva conversación
                </button>
              </div>
            </div>

            <nav
              aria-label="Lista de conversaciones"
              className="flex-1 min-h-0 overflow-y-auto p-2"
            >
              {conversationList.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6 px-4 leading-relaxed">
                  Tus conversaciones aparecerán aquí
                </p>
              ) : (
                conversationList.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      setActiveConversation(String(conv.id));
                      if (isMobile) setShowSidebar(false);
                    }}
                    aria-pressed={String(activeConversation) === String(conv.id)}
                    aria-label={`Conversación: ${conv.title || 'Nueva conversación'}`}
                    className={`w-full text-left p-3 rounded-xl mb-1 transition-all duration-150 ${
                      activeConversation === conv.id
                        ? 'bg-primary/10 border border-primary/20 shadow-sm'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <p className="font-medium text-foreground text-sm truncate">
                      {conv.title || 'Nueva conversación'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {(conv.updatedAt || conv.updated_at)
                        ? new Date(conv.updatedAt || conv.updated_at).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short',
                          })
                        : ''}
                    </p>
                  </button>
                ))
              )}
            </nav>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Main area ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center gap-3 px-4 flex-shrink-0">
          {isMobile && (
            <Link
              to="/home"
              aria-label="Volver al inicio"
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
            >
              <ChevronLeft size={18} />
            </Link>
          )}
          {!showSidebar && (
            <button
              type="button"
              onClick={() => setShowSidebar(true)}
              aria-label="Mostrar historial de conversaciones"
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
            >
              <Menu size={18} />
            </button>
          )}
          <div className="w-7 h-7 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-sm leading-tight">Captus AI</h1>
            <p className="text-xs text-muted-foreground">Tu asistente académico</p>
          </div>
        </header>

        {/* Messages area */}
        <main
          className="flex-1 min-h-0 overflow-y-auto"
          aria-label="Mensajes de conversación"
          aria-live="polite"
        >
          {!hasConversation ? (
            /* ── Empty state — shown ONLY when there's no active conversation ── */
            <div className="h-full flex flex-col items-center justify-center px-6 text-center">
              <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mb-5">
                <MessageSquare className="w-8 h-8 text-brand-500" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Sin conversaciones aún
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
                Inicia un chat con Captus AI y tus conversaciones aparecerán aquí.
              </p>
              <button
                onClick={handleNewConversation}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all font-medium shadow-brand-sm text-sm"
              >
                <Plus size={16} aria-hidden="true" />
                Iniciar conversación
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-6">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <Motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 mb-5 ${
                      message.type === 'user' ? 'flex-row-reverse' : ''
                    }`}
                    role="article"
                    aria-label={message.type === 'user' ? 'Tu mensaje' : 'Respuesta de Captus AI'}
                  >
                    {/* Avatar */}
                    <div
                      aria-hidden="true"
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        message.type === 'bot'
                          ? 'bg-gradient-to-br from-brand-400 to-brand-600'
                          : 'bg-primary'
                      }`}
                    >
                      {message.type === 'bot'
                        ? <Sparkles className="w-4 h-4 text-white" />
                        : <User className="w-4 h-4 text-white" />}
                    </div>

                    {/* Bubble */}
                    <div className={`flex-1 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                      <div
                        className={`inline-block max-w-[84%] rounded-xl px-4 py-3 shadow-xs ${
                          message.type === 'user'
                            ? 'bg-primary/10 border-l-[3px] border-primary'
                            : 'bg-card border border-border'
                        }`}
                      >
                        {message.type === 'bot' ? (
                          <MarkdownContent content={message.content} />
                        ) : (
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                            {message.content}
                          </p>
                        )}

                        {message.action && (
                          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg w-fit border border-brand-200">
                            <CheckCircle size={11} aria-hidden="true" />
                            Acción: {message.action.replace(/_/g, ' ')}
                          </div>
                        )}

                        <time
                          dateTime={message.timestamp.toISOString()}
                          className="block text-xs text-muted-foreground mt-1.5"
                        >
                          {message.timestamp.toLocaleTimeString('es-ES', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </time>
                      </div>
                    </div>
                  </Motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <Motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 mb-5"
                  aria-label="Captus AI está escribiendo..."
                  aria-live="polite"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xs">
                    <div className="flex gap-1.5 items-center h-4">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <Motion.div
                          key={i}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay }}
                          className="w-1.5 h-1.5 bg-primary rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </Motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input bar — only shown when a conversation is active */}
        {hasConversation && (
          <footer className="border-t border-border px-4 py-3 bg-background flex-shrink-0">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    aria-label="Escribe tu mensaje para Captus AI"
                    aria-multiline="true"
                    className="w-full bg-muted px-4 py-3 pr-4 border border-border rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary resize-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
                    rows={1}
                    disabled={isLoading}
                    style={{ minHeight: '44px', maxHeight: '160px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  aria-label="Enviar mensaje"
                  className="flex-shrink-0 p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-brand-sm"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 text-center">
                Captus AI puede cometer errores. Verifica la información importante.
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default ChatBotPage;
