'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { converseWithCompanion } from '@/ai/flows/converse-with-companion';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
    </div>
  );
}

export default function CompanionPage() {
  const { userName, companionName, chatHistory, setChatHistory } = useAppContext();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || !userName) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newChatHistory = [...chatHistory, userMessage];
    setChatHistory(newChatHistory);
    setInput('');
    setIsLoading(true);

    try {
      const result = await converseWithCompanion({
        userName: userName || 'friend',
        companionName,
        chatHistory: newChatHistory,
        message: input,
      });
      const modelMessage: ChatMessage = { role: 'model', content: result.reply };
      setChatHistory([...newChatHistory, modelMessage]);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Oh no!',
        description: "I'm having a little trouble thinking right now. Please try again in a moment.",
        variant: 'destructive',
      });
      setChatHistory(chatHistory);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Companion
        </div>
        <h1 className="text-4xl font-headline font-semibold">
          {companionName === 'Companion' ? 'Your Companion' : `Your Companion, ${companionName}`}
        </h1>
        <p className="text-muted-foreground max-w-xl">
          A calm friend who listens and remembers.
        </p>
      </div>

      <CardShell>
        <ScrollArea className="h-[60vh]" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {chatHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {getInitials(companionName)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium">This is the beginning of your conversation with {companionName}.</p>
                <p className="text-sm">You can change their name in the <Link href="/settings" className="underline">settings</Link>.</p>
              </div>
            )}
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-end gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(companionName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-md rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap shadow-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-muted-foreground rounded-bl-sm'
                  )}
                >
                  {message.content}
                </div>
                {message.role === 'user' && userName && (
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(userName || '')}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-3 justify-start">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(companionName)}
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-md rounded-2xl px-4 py-3 bg-muted text-muted-foreground rounded-bl-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border/60 p-4 flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder={`Message ${companionName}...`}
            disabled={isLoading || !userName}
            className="text-base"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !userName} size="icon">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardShell>
    </div>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-background/70 shadow-sm">
      {children}
    </div>
  );
}
