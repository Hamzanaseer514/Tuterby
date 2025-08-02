import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, X, Send, User, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today during our office hours?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isOfficeHours, setIsOfficeHours] = useState(true); 

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;

    setMessages(prev => [...prev, { id: Date.now(), text: inputText, sender: 'user' }]);
    setInputText('');

    
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Thanks for your message! An agent will be with you shortly.", sender: 'bot' }]);
    }, 1000);
  };
  
  
  React.useEffect(() => {
    const currentHour = new Date().getHours();
    
    setIsOfficeHours(true); 
  }, []);


  const fabVariants = {
    initial: { scale: 0, y: 50 },
    animate: { scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
    exit: { scale: 0, y: 50, transition: { duration: 0.2 } }
  };

  const chatWindowVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="fab"
            variants={fabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={toggleChat}
              className="rounded-full w-16 h-16 bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-xl hover:scale-110 transition-transform duration-200"
              aria-label="Open live chat support window"
            >
              <MessageSquare size={30} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            variants={chatWindowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 w-[calc(100%-3rem)] sm:w-96"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-window-title"
          >
            <Card className="shadow-2xl border-primary/50 bg-card/90 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-t-lg">
                <CardTitle id="chat-window-title" className="text-lg font-semibold">
                  {isOfficeHours ? "Chat with Us" : "Contact Us"}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={toggleChat} className="text-primary-foreground hover:bg-white/20" aria-label="Close chat window">
                  <X size={20} />
                </Button>
              </CardHeader>
              <CardContent className="p-4 h-80 overflow-y-auto custom-scrollbar space-y-3" aria-live="polite">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end space-x-2 max-w-[85%]",
                      msg.sender === 'user' ? "ml-auto flex-row-reverse space-x-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "p-1 rounded-full text-white",
                      msg.sender === 'user' ? 'bg-secondary' : 'bg-primary'
                    )} aria-hidden="true">
                      {msg.sender === 'user' ? <User size={16} /> : <Smile size={16} />}
                    </div>
                    <div
                      className={cn(
                        "p-3 rounded-xl break-words",
                        msg.sender === 'user'
                          ? "bg-secondary text-secondary-foreground rounded-br-none"
                          : "bg-muted text-muted-foreground rounded-bl-none"
                      )}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
                 {!isOfficeHours && messages.length === 1 && (
                  <div className="text-center text-muted-foreground text-sm p-4 bg-muted rounded-lg">
                    <p>We're currently offline. Our office hours are [Your Office Hours, e.g., 9 AM - 5 PM GMT].</p>
                    <p>Please leave a message, and we'll get back to you as soon as possible!</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-3 border-t">
                {isOfficeHours || messages.length > 1 ? (
                  <form onSubmit={handleSendMessage} className="flex items-center w-full space-x-2">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-grow"
                      disabled={!isOfficeHours && messages.length === 1}
                      aria-label="Type your message here"
                    />
                    <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90" disabled={!isOfficeHours && messages.length === 1 && inputText.trim() === ''} aria-label="Send message">
                      <Send size={18} />
                    </Button>
                  </form>
                ) : (
                   <div className="w-full text-center">
                    <Button onClick={() => setMessages(prev => [...prev, {id: Date.now(), text: "I'd like to leave a message.", sender: 'user'}])} aria-label="Leave a message (currently offline)">
                      Leave a Message
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;