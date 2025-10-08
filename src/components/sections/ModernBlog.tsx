import React from 'react';
import { Calendar } from 'lucide-react';

const ModernBlog = () => {
  const posts = [
    {
      title: "How to Value Your Digital Business in 2024",
      excerpt: "Learn the latest valuation methods and multiples for digital businesses",
      date: "March 15, 2024",
      category: "Valuation"
    },
    {
      title: "Top 10 Mistakes When Selling Your SaaS Business",
      excerpt: "Avoid these common pitfalls that can cost you thousands in your exit",
      date: "March 12, 2024",
      category: "Tips"
    },
    {
      title: "Understanding Due Diligence: A Complete Guide",
      excerpt: "Everything you need to know about the due diligence process",
      date: "March 8, 2024",
      category: "Guide"
    },
    {
      title: "Market Trends: Digital Business Acquisitions in 2024",
      excerpt: "What buyers are looking for and how to position your business",
      date: "March 5, 2024",
      category: "Market"
    }
  ];

  return (
    <section className="py-20 px-4 bg-[#121212]">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Blog
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Expert insights and guides on selling your digital business
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post, index) => (
            <div 
              key={index}
              className="bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer group"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800"></div>
              <div className="p-6">
                <div className="inline-block bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  {post.category}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModernBlog;
