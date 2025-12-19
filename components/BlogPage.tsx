
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, BlogPost } from './DataContext';
import { X, ArrowRight, Calendar, User } from 'lucide-react';

const BlogPage: React.FC = () => {
   const { blogs } = useData();
   const navigate = useNavigate();
   const [activeTag, setActiveTag] = useState<string>('All');
   const [readingPost, setReadingPost] = useState<BlogPost | null>(null);

   // Extract unique tags
   const allTags = ['All', ...Array.from(new Set(blogs.flatMap(b => b.tags)))];

   // Filter logic
   const filteredBlogs = activeTag === 'All'
      ? blogs
      : blogs.filter(b => b.tags.includes(activeTag));

   // Handle scroll locking when reading
   useEffect(() => {
      if (readingPost) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => { document.body.style.overflow = 'unset'; };
   }, [readingPost]);

   return (
      <div className="min-h-screen bg-white pt-24">

         {/* Header */}
         <div className="max-w-7xl mx-auto px-6 mb-12">
            <h1 className="text-6xl md:text-8xl font-heavy uppercase mb-8">Alliance<br />Insights</h1>
            <p className="text-xl max-w-2xl text-neutral-600">
               Deep dives into coworking trends, marketing experiments, and operational strategies from Denver's leading space operators.
            </p>
         </div>

         {/* Filters */}
         <div className="border-y border-neutral-200 sticky top-[80px] bg-white/95 backdrop-blur z-30">
            <div className="max-w-7xl mx-auto px-6 py-4 overflow-x-auto hide-scrollbar">
               <div className="flex gap-4">
                  {allTags.map(tag => (
                     <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={`whitespace-nowrap px-6 py-2 text-sm font-bold uppercase tracking-wider border transition-all ${activeTag === tag
                           ? 'bg-black text-white border-black'
                           : 'bg-white text-neutral-500 border-neutral-300 hover:border-black hover:text-black'
                           }`}
                     >
                        {tag}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Blog Grid - Image Forward */}
         <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
               {filteredBlogs.map((blog, index) => (
                  <article
                     key={blog.id}
                     className={`group cursor-pointer flex flex-col ${index % 3 === 0 ? 'md:col-span-2 mb-12' : ''}`}
                     onClick={() => navigate(`/insights/${blog.id}`)}
                  >
                     <div className={`overflow-hidden bg-neutral-100 mb-6 ${index % 3 === 0 ? 'aspect-[21/9]' : 'aspect-[4/3]'}`}>
                        <img
                           src={blog.imageUrl}
                           alt={blog.title}
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-90"
                        />
                     </div>
                     <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                           {blog.tags.map(t => (
                              <span key={t} className="text-xs font-bold uppercase text-blue-600 tracking-widest">{t}</span>
                           ))}
                        </div>
                        <h2 className={`font-heavy uppercase leading-none group-hover:underline decoration-4 underline-offset-4 decoration-blue-600 ${index % 3 === 0 ? 'text-4xl md:text-6xl' : 'text-3xl md:text-4xl'}`}>
                           {blog.title}
                        </h2>
                        <p className="text-neutral-500 text-lg line-clamp-2 max-w-2xl">
                           {blog.excerpt}
                        </p>
                        <div className="flex items-center text-xs font-bold uppercase text-neutral-400 mt-2">
                           <span>{blog.date}</span>
                           <span className="mx-2">•</span>
                           <span>{blog.author}</span>
                           <span className="ml-auto text-black group-hover:translate-x-2 transition-transform flex items-center">
                              Read Article <ArrowRight className="w-4 h-4 ml-1" />
                           </span>
                        </div>
                     </div>
                  </article>
               ))}
            </div>

            {filteredBlogs.length === 0 && (
               <div className="py-24 text-center">
                  <p className="text-2xl font-heavy uppercase text-neutral-300">No articles found in this category.</p>
               </div>
            )}
         </div>

         {/* Full Screen Reader View Modal */}
         {readingPost && (
            <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-bottom-10 duration-300">
               <button
                  onClick={() => setReadingPost(null)}
                  className="fixed top-6 right-6 z-50 bg-black text-white p-3 rounded-full hover:bg-blue-600 transition-colors shadow-xl"
               >
                  <X className="w-6 h-6" />
               </button>

               <div className="w-full h-[60vh] relative">
                  <img src={readingPost.imageUrl} className="w-full h-full object-cover" alt={readingPost.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-5xl mx-auto">
                     <div className="flex gap-2 mb-4">
                        {readingPost.tags.map(t => (
                           <span key={t} className="bg-blue-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">{t}</span>
                        ))}
                     </div>
                     <h1 className="text-4xl md:text-7xl text-white font-heavy uppercase leading-none drop-shadow-xl mb-6">
                        {readingPost.title}
                     </h1>
                     <div className="flex items-center text-white/80 font-bold uppercase tracking-widest text-sm gap-6">
                        <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {readingPost.date}</div>
                        <div className="flex items-center"><User className="w-4 h-4 mr-2" /> {readingPost.author}</div>
                     </div>
                  </div>
               </div>

               <div className="max-w-3xl mx-auto px-6 py-16">
                  {/* Render HTML Content from Rich Text Editor */}
                  <div
                     className="prose prose-lg prose-neutral md:prose-xl prose-headings:font-heavy prose-headings:uppercase prose-img:rounded-md prose-a:text-blue-600 prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-4 prose-blockquote:italic"
                     dangerouslySetInnerHTML={{ __html: readingPost.content }}
                  />

                  <div className="mt-16 pt-16 border-t border-neutral-200 text-center">
                     <h3 className="text-2xl font-heavy uppercase mb-6">Enjoyed this read?</h3>
                     <button onClick={() => setReadingPost(null)} className="bg-black text-white px-8 py-4 font-bold uppercase hover:bg-neutral-800">
                        Back to Insights
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default BlogPage;
