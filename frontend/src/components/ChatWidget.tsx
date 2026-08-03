import React, { useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { MessageCircle, Send, X } from 'lucide-react';

export default function ChatWidget({ userRole, initialOpen = false }: { userRole: 'Customer' | 'Admin', initialOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<{user: string, text: string}[]>([]);
  const [input, setInput] = useState('');
  const [connection, setConnection] = useState<any>(null);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5119/hubs/chat')
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => {
        newConnection.on('ReceiveMessage', (user, text) => {
          setMessages(prev => [...prev, { user, text }]);
        });
      })
      .catch(e => console.error('SignalR Connection Error: ', e));

    setConnection(newConnection);
    return () => { newConnection.stop(); };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && connection) {
      try {
        await connection.send('SendMessage', userRole, input);
        setInput('');
      } catch (e) { console.error(e); }
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#101130] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#e21b5a] transition-all z-50"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e21b5a] rounded-full border-2 border-white animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-10">
      <div className="bg-[#101130] p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">{userRole === 'Admin' ? 'Customer Support' : 'Live Support'}</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:text-[#e21b5a] transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <div className="h-80 bg-gray-50/50 p-4 overflow-y-auto flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest mt-4">Start a conversation...</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] p-3 rounded-2xl text-xs ${m.user === userRole ? 'bg-[#101130] text-white self-end rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 self-start rounded-bl-none'}`}>
            <p className="text-[9px] font-bold opacity-50 mb-1">{m.user}</p>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-50 flex gap-2">
        <input 
          value={input} onChange={e => setInput(e.target.value)} 
          placeholder="Type a message..." 
          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#e21b5a]"
        />
        <button type="submit" className="w-9 h-9 bg-[#e21b5a] text-white rounded-xl flex items-center justify-center hover:bg-[#101130] transition-colors"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  );
}
