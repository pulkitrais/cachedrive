import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';

interface Post {
  id: string;
  content: string;
  timestamp: string;
}

const generateId = () => Math.random().toString(16).substring(2, 10).toUpperCase();
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true); // default to dark mode for CRT vibe
  const [posts, setPosts] = useState<Post[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        setIsLoading(false);
        return;
      }

      if (data) setPosts(data as Post[]);
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSubmit = async () => {
    if (!inputText.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const newPost: Post = {
      id: generateId(),
      content: inputText,
      timestamp: getTimestamp(),
    };

    const { error } = await supabase.from('posts').insert(newPost);

    if (error) {
      console.error('Error saving post:', error);
      setIsSubmitting(false);
      return;
    }

    setPosts([newPost, ...posts]);
    setInputText('');
    setIsSubmitting(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-6 selection:bg-[var(--color-text)] selection:text-[var(--color-bg)]">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-[var(--color-border)] pb-4 mb-4 gap-4">
         <div>
           <h1 className="text-3xl md:text-5xl font-bold tracking-tighter flex items-center gap-2">
             CACHE_DRIVE <span className="w-4 h-8 md:w-6 md:h-10 bg-[var(--color-text)] blink inline-block"></span>
           </h1>
           <p className="text-sm uppercase tracking-widest mt-2 opacity-80">
             Public Archive v1.0 // est. 2026
           </p>
         </div>
         <button 
           onClick={() => setIsDarkMode(!isDarkMode)}
           className="uppercase font-bold border-2 border-[var(--color-border)] px-4 py-2 shadow-[4px_4px_0px_0px_var(--color-shadow)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-none text-xs md:text-sm bg-[var(--color-surface)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] cursor-pointer"
         >
           [{isDarkMode ? 'MODE: LIGHT' : 'MODE: DARK'}]
         </button>
       </header>

       <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
         <section className="lg:col-span-5 flex flex-col gap-6">
           <div className="border-2 border-[var(--color-border)] flex flex-col h-64 md:h-96 shadow-[6px_6px_0px_0px_var(--color-shadow)] relative bg-[var(--color-surface)]">
             <div className="bg-[var(--color-text)] text-[var(--color-bg)] px-3 py-1 font-bold text-sm uppercase flex justify-between border-b-2 border-[var(--color-border)]">
               <span>Input_Terminal</span>
               <span>TTY1</span>
             </div>
             <div className="flex-1 p-3 relative flex flex-col">
               <textarea
                 ref={textareaRef}
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 className="w-full h-full bg-transparent resize-none outline-none retro-textarea"
                 spellCheck={false}
                 placeholder="> ENTER TEXT HERE..."
               />
             </div>
           </div>
           <button
             onClick={handleSubmit}
             disabled={isSubmitting}
             className="uppercase font-bold border-2 border-[var(--color-border)] px-4 py-3 shadow-[6px_6px_0px_0px_var(--color-shadow)] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] transition-none bg-[var(--color-surface)] w-full text-center hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT_DATA'}
           </button>
           
           <div className="text-xs opacity-80 font-mono mt-2 hidden lg:block">
             <p>=====================================</p>
             <p>STATUS : ONLINE</p>
             <p>UPLINK : SECURE</p>
             <p>MEMORY : 640K OK</p>
             <p>=====================================</p>
           </div>
         </section>

         <section className="lg:col-span-7 flex flex-col">
            <h2 className="text-xl font-bold mb-6 uppercase tracking-wider">++ RECENT_ARCHIVES ++</h2>
            {isLoading ? (
              <p className="opacity-50 italic">LOADING ARCHIVE...</p>
            ) : (
              <div className="flex flex-col gap-8">
                {posts.map((post, i) => (
                  <div key={post.id} className="flex flex-col gap-3 group">
                     <div className="flex justify-between items-center text-xs border-b border-dashed border-[var(--color-border)] pb-2 uppercase tracking-wide opacity-80">
                       <span className="font-bold">ID: {post.id}</span>
                       <span>{post.timestamp}</span>
                     </div>
                     <p className="whitespace-pre-wrap break-words leading-relaxed text-sm md:text-base">
                       {post.content}
                     </p>
                     {i !== posts.length - 1 && (
                       <div className="text-[var(--color-border)] opacity-30 mt-6 text-xs tracking-widest text-center">
                         * * *
                       </div>
                     )}
                  </div>
                ))}
                {posts.length === 0 && (
                   <p className="opacity-50 italic">NO DATA FOUND IN ARCHIVE.</p>
                )}
              </div>
            )}
         </section>
       </main>
       
       <footer className="border-t-2 border-[var(--color-border)] pt-6 mt-12 text-center text-xs opacity-70 flex justify-between uppercase">
          <span>c:/sys/CacheDrive&gt; _</span>
          <span>EOF</span>
       </footer>
    </div>
  );
}
