
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
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
    if (input.trim() === '') return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newChatHistory = [...chatHistory, userMessage];
    setChatHistory(newChatHistory);
    setInput('');
    setIsLoading(true);

    try {
      const result = await converseWithCompanion({
        userName,
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
       setChatHistory(chatHistory); // Revert to previous history on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
       <div className="mb-4 text-center">
        <h1 className="text-3xl font-headline font-bold">Your Companion, {companionName}</h1>
        <p className="text-muted-foreground">
          She's here to listen. Tell her anything.
        </p>
      </div>
      
      <div className="flex-grow overflow-hidden rounded-lg border">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-6">
            {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                            {getInitials(companionName)}
                        </AvatarFallback>
                    </Avatar>
                    <p className="font-medium">This is the beginning of your conversation with {companionName}.</p>
                    <p className="text-sm">You can change her name in the <Link href="/settings" className="underline">settings</Link>.</p>
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
                    'max-w-md rounded-xl px-4 py-3 text-sm whitespace-pre-wrap',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-muted-foreground rounded-bl-none'
                  )}
                >
                  {message.content}
                </div>
                 {message.role === 'user' && (
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(userName)}
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
                  <div className="max-w-md rounded-xl px-4 py-3 bg-muted text-muted-foreground rounded-bl-none">
                     <TypingIndicator />
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          placeholder={`Message ${companionName}...`}
          disabled={isLoading}
          className="text-base"
        />
        <Button onClick={handleSendMessage} disabled={isLoading} size="icon">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
