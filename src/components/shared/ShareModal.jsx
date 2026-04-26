import React, { useState, useEffect, useRef } from 'react';
import { 
  FaWhatsapp, 
  FaFacebookF, 
  FaXTwitter, 
  FaRedditAlien, 
  FaPinterestP, 
  FaLinkedinIn 
} from 'react-icons/fa6';
import { FiMail, FiCode, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const SHARE_OPTIONS = [
  {
    id: 'embed',
    name: 'Embed',
    icon: <FiCode className="w-7 h-7" />,
    color: 'bg-[#3f3f3f] text-white',
    action: (url) => {}
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: <FaWhatsapp className="w-8 h-8" />,
    color: 'bg-[#25D366] text-white',
    action: (url) => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`, '_blank')
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <FaFacebookF className="w-7 h-7" />,
    color: 'bg-[#1877F2] text-white',
    action: (url) => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  },
  {
    id: 'x',
    name: 'X',
    icon: <FaXTwitter className="w-7 h-7" />,
    color: 'bg-black text-white',
    action: (url) => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank')
  },
  {
    id: 'email',
    name: 'Email',
    icon: <FiMail className="w-7 h-7" />,
    color: 'bg-[#888888] text-white',
    action: (url) => window.open(`mailto:?body=${encodeURIComponent(url)}`, '_blank')
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: <FaRedditAlien className="w-7 h-7" />,
    color: 'bg-[#FF4500] text-white',
    action: (url) => window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}`, '_blank')
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: <FaPinterestP className="w-7 h-7" />,
    color: 'bg-[#E60023] text-white',
    action: (url) => window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}`, '_blank')
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <FaLinkedinIn className="w-6 h-6" />,
    color: 'bg-[#0A66C2] text-white',
    action: (url) => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
  }
];

export default function ShareModal({ isOpen, onClose, shareUrl }) {
  const [copied, setCopied] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const urlToShare = shareUrl || window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(urlToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="bg-[#212121] text-white w-full max-w-[520px] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-5 px-6">
          <h3 className="font-body text-[18px] font-medium">Share</h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-2 pb-8">
          
          {/* Share options */}
          <div className="relative mb-8 group">
            <button 
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-10 w-9 h-9 bg-[#212121] shadow-[0_0_10px_2px_rgba(33,33,33,0.8)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#3d3d3d] border border-white/10"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-10 w-9 h-9 bg-[#212121] shadow-[0_0_10px_2px_rgba(33,33,33,0.8)] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#3d3d3d] border border-white/10"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
            
            <div 
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-hide snap-x px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {SHARE_OPTIONS.map((option) => (
                <div 
                  key={option.id} 
                  className="flex flex-col items-center gap-2 min-w-[76px] cursor-pointer snap-start hover:opacity-80 transition-opacity" 
                  onClick={() => option.action(urlToShare)}
                >
                  <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center ${option.color}`}>
                    {option.icon}
                  </div>
                  <span className="text-[13px] font-body text-[#AAAAAA] mt-1">
                    {option.name}
                  </span>
                </div>
              ))}
            </div>
            {/* Custom CSS to hide webkit scrollbar but it's okay inline style scrollbar-hide works with tailwind config usually */}
          </div>

          {/* Link box */}
          <div className="bg-[#0f0f0f] border border-white/20 rounded-xl flex items-center focus-within:border-[#3ea6ff] outline outline-1 outline-transparent focus-within:outline-[#3ea6ff] transition-all overflow-hidden h-[50px]">
            <div className="flex-1 overflow-x-auto px-4 text-sm text-[#F1F1F1] font-body whitespace-nowrap scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {urlToShare}
            </div>
            <button
              onClick={handleCopy}
              className={`h-full px-5 font-medium text-[14px] font-body transition-colors flex items-center justify-center ${copied ? 'bg-white text-black' : 'bg-[#3ea6ff] hover:bg-[#65b8ff] text-black rounded-r-xl rounded-l-[18px]'}`}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
