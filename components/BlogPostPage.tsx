
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from './DataContext';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';

const BlogPostPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { blogs } = useData();
    const navigate = useNavigate();

    const post = blogs.find(b => String(b.id) === id);

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-black">
                <div className="text-center">
                    <h2 className="text-4xl font-heavy uppercase mb-4">Post Not Found</h2>
                    <button onClick={() => navigate('/insights')} className="underline font-bold uppercase">Back to Insights</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black pb-24">
            {/* Header / Hero */}
            <div className="w-full h-[70vh] relative pt-20">
                <img src={post.imageUrl} className="w-full h-full object-cover" alt={post.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <button
                            onClick={() => navigate('/insights')}
                            className="flex items-center gap-2 font-bold uppercase text-xs text-white/70 mb-8 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Insights
                        </button>

                        <div className="flex gap-2 mb-6">
                            {post.tags.map(t => (
                                <span key={t} className="bg-blue-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">{t}</span>
                            ))}
                        </div>

                        <h1 className="text-4xl md:text-8xl text-white font-heavy uppercase leading-[0.9] mb-8 drop-shadow-2xl">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center text-white font-bold uppercase tracking-widest text-xs gap-y-4 gap-x-8">
                            <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-blue-400" /> {post.date}</div>
                            <div className="flex items-center"><User className="w-4 h-4 mr-2 text-blue-400" /> {post.author}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 pt-20">
                <div
                    className="prose prose-lg prose-neutral md:prose-xl prose-headings:font-heavy prose-headings:uppercase prose-img:rounded-sm prose-a:text-blue-600 prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-neutral-500"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="mt-20 pt-12 border-t border-neutral-100 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/insights')}
                        className="bg-black text-white px-8 py-4 font-bold uppercase hover:bg-neutral-800 transition-colors"
                    >
                        Return to Blog
                    </button>

                    <button className="flex items-center gap-2 font-bold uppercase text-sm hover:text-blue-600 transition-colors">
                        <Share2 className="w-5 h-5" /> Share Article
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlogPostPage;
