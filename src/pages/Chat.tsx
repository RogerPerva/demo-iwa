import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Send, Bot, User, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Tipo para las conversaciones
interface Conversation {
  id: string;
  name: string;
  companyId: string;
}

export default function Chat() {
  const { currentCompany, chatMessages, addChatMessage, clearChatMessages } = useStore();
  const [newMessage, setNewMessage] = useState('');
  const [activeConversationId, setActiveConversationId] = useState('conversation-1');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // 🔹 Ancla al final de la lista de mensajes
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  // 💬 Estado de conversaciones (ahora puede cambiar)
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: 'conversation-1', name: 'Soporte Técnico', companyId: currentCompany?.id || '' },
    { id: 'conversation-2', name: 'Empresa B - Consultas', companyId: 'company-b' },
  ]);

  // Conversación activa
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Mensajes de la conversación activa
  const conversationMessages = chatMessages.filter(
    (m) => m.companyId === activeConversation?.companyId
  );

  // 📊 Log para ver cuándo se renderiza el componente
  console.log('🔄 Chat re-renderizado. Conversación activa:', activeConversation?.name, 'Mensajes:', conversationMessages.length);

  // 🔹 Cada vez que cambien los mensajes, baja al final automáticamente
  useEffect(() => {
    console.log('✨ useEffect ejecutado - Haciendo scroll al final');
    endOfMessagesRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [conversationMessages.length]); // usar length evita renders innecesarios

  // 📤 Función que envía un mensaje directamente
  const sendMessage = (messageText: string) => {
    if (!activeConversation?.companyId) return;

    console.log('📤 Enviando mensaje del usuario:', messageText);

    addChatMessage({
      text: messageText,
      sender: 'user',
      companyId: activeConversation.companyId,
    });

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponses = [
        'Entiendo tu consulta. ¿Podrías darme más detalles?',
        'Déjame verificar esa información para ti.',
        'He registrado tu solicitud. Nuestro equipo la revisará pronto.',
        'Perfecto, ¿hay algo más en lo que pueda ayudarte?',
        'Gracias por contactarnos. ¿Necesitas ayuda con algo más?',
      ];

      const response =
        botResponses[Math.floor(Math.random() * botResponses.length)];

      console.log('🤖 Bot respondiendo:', response);

      addChatMessage({
        text: response,
        sender: 'bot',
        companyId: activeConversation.companyId,
      });
    }, 1000);
  };

  // 📝 Handler para el botón de enviar (usa el input)
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    sendMessage(newMessage);

    console.log('🗑️ Limpiando input');
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 🗑️ Limpiar mensajes de conversación activa
  const handleClearChat = () => {
    if (!activeConversation?.companyId) return;

    console.log('🗑️ Limpiando mensajes de:', activeConversation.name);
    clearChatMessages(activeConversation.companyId);
    toast.success('Mensajes eliminados');
  };

  // ➕ Crear nueva conversación
  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: `conversation-${Date.now()}`,
      name: `Conversación ${conversations.length + 1}`,
      companyId: `company-${Date.now()}`
    };

    console.log('➕ Creando nueva conversación:', newConversation.name);
    setConversations([...conversations, newConversation]);
    setActiveConversationId(newConversation.id);
    toast.success(`Conversación "${newConversation.name}" creada`);
  };

  // ❌ Confirmar eliminación de conversación
  const handleDeleteConversation = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  // 🗑️ Eliminar conversación confirmada
  const confirmDeleteConversation = () => {
    if (!conversationToDelete) return;

    const conversation = conversations.find(c => c.id === conversationToDelete);
    if (!conversation) return;

    console.log('🗑️ Eliminando conversación:', conversation.name);

    // Eliminar conversación
    const newConversations = conversations.filter(c => c.id !== conversationToDelete);
    setConversations(newConversations);

    // Eliminar mensajes asociados
    clearChatMessages(conversation.companyId);

    // Si era la activa, cambiar a la primera disponible
    if (activeConversationId === conversationToDelete && newConversations.length > 0) {
      setActiveConversationId(newConversations[0].id);
    }

    toast.success(`Conversación "${conversation.name}" eliminada`);
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chat de Soporte</h1>
        <p className="text-muted-foreground mt-1">
          Comunícate con el equipo de soporte técnico
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Conversaciones */}
        <Card className="lg:col-span-1">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversaciones</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearChat}
                  disabled={conversationMessages.length === 0}
                  title="Limpiar mensajes"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleNewConversation}
                  title="Nueva conversación"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const messages = chatMessages.filter(m => m.companyId === conversation.companyId);
                const isActive = conversation.id === activeConversationId;

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-colors group',
                      isActive
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted/50 border-transparent hover:bg-muted'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'p-2 rounded-lg cursor-pointer',
                          isActive ? 'bg-primary' : 'bg-primary/50'
                        )}
                        onClick={() => setActiveConversationId(conversation.id)}
                      >
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setActiveConversationId(conversation.id)}
                      >
                        <p className="text-sm font-medium truncate">{conversation.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {messages.length > 0
                            ? messages[messages.length - 1].text
                            : 'Inicia una conversación'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {messages.length > 0 && (
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {messages.length}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation.id);
                          }}
                          title="Eliminar conversación"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Área del Chat */}
        <Card className="lg:col-span-2">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{activeConversation?.name || 'Chat'}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {conversationMessages.length} mensajes · Activo ahora
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent
          className="p-0 flex flex-col"
          style={{ height: 'calc(100vh - 400px)' }}
        >
          {/* Mensajes */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {conversationMessages.length === 0 && (
                <div className="flex items-center justify-center h-full py-12">
                  <div className="text-center">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No hay mensajes aún. Inicia la conversación.
                    </p>
                  </div>
                </div>
              )}

              {conversationMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.sender === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  )}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg px-4 py-2',
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={cn(
                        'text-xs mt-1',
                        message.sender === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>

                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* 🔹 Ancla al final del chat */}
              <div ref={endOfMessagesRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Escribe tu mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Respuestas Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              'Necesito ayuda con el inventario',
              '¿Cómo genero un reporte?',
              'Tengo un problema técnico',
            ].map((quickMessage, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => sendMessage(quickMessage)}
                className="justify-start text-left h-auto py-3"
              >
                {quickMessage}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar conversación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la conversación y todos sus mensajes permanentemente.
              No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConversationToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteConversation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
