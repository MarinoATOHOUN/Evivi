
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, HelpCircle, Book, MessageSquare, Shield, ChevronRight, Mail } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

const HelpCenter: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const helpTopics = [
    { icon: <HelpCircle className="text-orange-500" />, title: "Account & Profile", desc: "Manage your information and privacy" },
    { icon: <Book className="text-orange-500" />, title: "Recipe Guide", desc: "How to share and save your favorites" },
    { icon: <MessageSquare className="text-orange-500" />, title: "Community Rules", desc: "Interacting with other foodies" },
    { icon: <Shield className="text-orange-500" />, title: "Security", desc: "Keep your kitchen safe and secure" },
  ];

  const faqs = [
    "How do I upload a video recipe?",
    "Can I edit a recipe after publishing?",
    "How to verify my chef status?",
    "Report a community violation"
  ];

  return (
    <PageWrapper withPadding={false} className="bg-[#FDF8F5]">
      {/* Header */}
      <header className="px-4 py-6 flex items-center justify-center sticky top-0 bg-[#FDF8F5]/80 backdrop-blur-md z-10 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute left-4 p-2 text-gray-900 active:scale-90 transition-transform"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Help Center</h1>
      </header>

      <div className="px-6 py-8 space-y-10 max-w-2xl mx-auto pb-32">
        {/* Search */}
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">How can we help you?</h2>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles..."
              className="w-full bg-white border border-gray-100 rounded-2xl py-5 pl-14 pr-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-100 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <section className="space-y-4">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Topic Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helpTopics.map((topic, i) => (
              <button key={i} className="flex items-center gap-4 bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm text-left active:scale-[0.98] transition-transform">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                  {topic.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{topic.title}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{topic.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Popular Questions */}
        <section className="space-y-4">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Popular Questions</h3>
          <div className="bg-white rounded-[32px] overflow-hidden border border-gray-50 shadow-sm">
            {faqs.map((faq, i) => (
              <button key={i} className={`w-full flex items-center justify-between p-6 text-left active:bg-gray-50 transition-colors ${i !== faqs.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <span className="text-[14px] font-bold text-gray-700">{faq}</span>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-gradient-to-br from-[#124E4C] to-[#0A2E2C] rounded-[40px] p-8 text-white text-center space-y-6 shadow-xl shadow-teal-900/10">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-2 backdrop-blur-md border border-white/10">
            <Mail size={28} />
          </div>
          <h3 className="text-xl font-black tracking-tight">Still need help?</h3>
          <p className="text-white/70 text-sm font-medium leading-relaxed">
            Can't find what you're looking for? Our support team is ready to help you with any kitchen trouble.
          </p>
          <button className="w-full bg-white text-[#124E4C] font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform uppercase tracking-wider text-xs">
            Send Message
          </button>
        </section>
      </div>
    </PageWrapper>
  );
};

export default HelpCenter;
