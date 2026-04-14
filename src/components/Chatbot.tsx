import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getChatSession } from '../services/geminiService';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'مرحباً بك في مركز الدكتور صالح الرداعي! أنا المساعد الذكي، كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chat = getChatSession();
      const response = await chat.sendMessage({ message: input });
      const modelMessage = { role: 'model' as const, text: response.text || "عذراً، لم أستطع فهم سؤالك." };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model' as const, text: "حدث خطأ أثناء التواصل مع المساعد الذكي." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button 
              onClick={() => setIsOpen(true)} 
              className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 border-4 border-white/20 relative group"
            >
              <MessageCircle className="w-8 h-8 text-white" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white"></span>
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] shadow-2xl z-50 flex flex-col rounded-3xl overflow-hidden bg-white border border-slate-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border-2 border-white/20">
                    <AvatarFallback className="bg-teal-500 text-white">د.ص</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">المساعد الذكي</h3>
                  <p className="text-xs text-teal-100 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    مركز د. صالح الرداعي
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'model' && (
                      <Avatar className="w-8 h-8 shrink-0 mt-1 shadow-sm">
                        <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={`p-3.5 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-teal-600 text-white rounded-tr-sm' 
                          : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'
                      }`}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 justify-start"
                  >
                    <Avatar className="w-8 h-8 shrink-0 mt-1 shadow-sm">
                      <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">AI</AvatarFallback>
                    </Avatar>
                    <div className="p-4 rounded-2xl bg-white border border-slate-100 rounded-tl-sm shadow-sm flex items-center gap-2">
                      <span className="flex gap-1">
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="relative flex items-center">
                <Input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="اكتب رسالتك هنا..."
                  className="pr-4 pl-12 py-6 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-teal-500 shadow-inner"
                  disabled={loading}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={loading || !input.trim()}
                  className="absolute left-1.5 w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 p-0 flex items-center justify-center shadow-md transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4 text-white -ml-1" />
                </Button>
              </div>
              <div className="text-center mt-3">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  مدعوم بالذكاء الاصطناعي
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
