import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const EbookViewer = () => {
  const [view, setView] = useState('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isRapidFlipping, setIsRapidFlipping] = useState(false);

  // Chapter data structure
  const chapters = {
    1: {
      title: 'LIGHT AND DARK BOTH LIVE WITHIN YOU',
      number: 1,
      content: `We are not born into light or darkness. We arrive into a moment where both exist equally, suspended in the space between our first breath and the first question we'll never ask.

The world presents itself in duality: good and bad, right and wrong, joy and sorrow. But these categories are merely convenient fictions—shortcuts our minds create to navigate complexity. The truth is far more nuanced and beautiful.

Within every human being exists an intricate ecosystem of light and shadow. The light represents our capacity for joy, compassion, growth, and creativity. It is the part of us that reaches toward others, that creates beauty from chaos, that dares to hope.

But equally vital—and equally beautiful—is our shadow. Our shadow is not evil or shameful. It is the repository of all we have deemed unacceptable, all we have hidden from ourselves and the world. Our anger, our jealousy, our shame, our desires—these are not demons to be vanquished. They are teachers, guardians of truths we were afraid to acknowledge.

To live with awareness is not to choose one over the other. It is to hold both, to understand both, to integrate both into a coherent whole. When we deny our shadow, it grows in power, influencing our choices from the darkness we've banished it to.

When we deny our light, we diminish ourselves, playing small in a world that desperately needs our brilliance.

--- ♦ ---

The art of understanding begins here—in the recognition that light and dark both live within you, and your task is not to eradicate one but to know both intimately.`
    },
    3: {
      title: 'THE NAMES I NEVER QUESTIONED',
      number: 3,
      content: `We inherit names before we inherit anything else. Not just the surnames that trace our lineage, but the identities that are grafted onto us from birth. I am told who I should be before I have any say in the matter.

Woman. Daughter. Indian. Educated. Traditional. Modern. A thousand labels, each one a small cage, and we live our lives learning to fit inside them, never asking if we chose to enter.

The names I never questioned came from every direction. From parents who loved me and wanted to protect me through definition. From society that needed me to be legible, categorizable, predictable. From teachers who saw potential and shaped it into acceptable forms.

From friends who knew me only as the version I presented to them. But there comes a moment—or perhaps many moments—when you realize that these names don't fit anymore. Or perhaps they never did, and you've simply been contorting yourself to make the shape work.

That moment is terrifying and liberating in equal measure. To question the names you've never questioned before is to stand naked before yourself and ask: Who am I, beneath all these identities? What remains when I strip away the labels?

This is not a question for the young, necessarily. It can come at any age, triggered by any catalyst—loss, love, betrayal, success, or simply the quiet accumulation of moments where you felt like a stranger to yourself.

--- ♦ ---

The truth I've come to understand is this: You are not bound by the names that were given to you. You can examine them, one by one, and decide whether they serve you. You can discard them. You can rewrite them. You can create entirely new definitions of who you are. This is the deepest form of freedom, and it is available to anyone brave enough to question what they've never questioned before.`
    }
  };

  // Break content into pages (approximately 250 words per page for readability)
  const getPages = (content) => {
    const paragraphs = content.split('\n\n');
    const pages = [];
    let currentPageContent = [];
    let wordCount = 0;
    const wordsPerPage = 250;

    paragraphs.forEach((para) => {
      const paraWords = para.split(' ').length;
      if (wordCount + paraWords > wordsPerPage && currentPageContent.length > 0) {
        pages.push(currentPageContent.join('\n\n'));
        currentPageContent = [para];
        wordCount = paraWords;
      } else {
        currentPageContent.push(para);
        wordCount += paraWords;
      }
    });

    if (currentPageContent.length > 0) {
      pages.push(currentPageContent.join('\n\n'));
    }

    return pages;
  };

  const currentChapterData = chapters[currentChapter];
  const pages = getPages(currentChapterData.content);
  const totalPages = pages.length;

  // Handle rapid page flipping for chapter navigation
  useEffect(() => {
    if (!isRapidFlipping) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => {
        if (prev < totalPages - 1) {
          return prev + 1;
        } else {
          setIsRapidFlipping(false);
          return prev;
        }
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isRapidFlipping, totalPages]);

  const handleChapterClick = (chapterNum) => {
    if (chapterNum === currentChapter && currentPage === 0) {
      setSidebarOpen(false);
      return;
    }

    setCurrentChapter(chapterNum);
    setCurrentPage(0);
    setIsRapidFlipping(true);
    setSidebarOpen(false);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setIsFlipping(true);
      setTimeout(() => setIsFlipping(false), 500);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setIsFlipping(true);
      setTimeout(() => setIsFlipping(false), 500);
    }
  };

  const handleBeginJourney = () => {
    setView('reading');
    setCurrentPage(0);
  };

  // Landing View
  if (view === 'landing') {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-[#121110] via-[#1a1816] to-[#0f0e0d] overflow-hidden relative">
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.9) 100%)'
          }}
        />

        {/* Canyon walls with gradient */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-gradient-to-r from-[#1a1816] to-transparent" />
          <div className="w-1/2 bg-gradient-to-l from-[#1a1816] to-transparent" />
        </div>

        {/* Glowing golden pathway */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          {/* Main path glow */}
          <defs>
            <linearGradient id="pathGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#d4af37', stopOpacity: 0 }} />
              <stop offset="30%" style={{ stopColor: '#e5c158', stopOpacity: 0.4 }} />
              <stop offset="50%" style={{ stopColor: '#f4d957', stopOpacity: 0.8 }} />
              <stop offset="70%" style={{ stopColor: '#e5c158', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#ffd700', stopOpacity: 0.9 }} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Winding pathway */}
          <path
            d="M 500,50 Q 480,150 500,250 Q 520,350 490,450 Q 470,550 510,650 Q 530,750 500,850 L 500,1000"
            fill="none"
            stroke="url(#pathGlow)"
            strokeWidth="40"
            filter="url(#glow)"
            opacity="0.9"
          />

          {/* Additional glow layers */}
          <path
            d="M 500,50 Q 480,150 500,250 Q 520,350 490,450 Q 470,550 510,650 Q 530,750 500,850 L 500,1000"
            fill="none"
            stroke="rgba(244, 217, 87, 0.2)"
            strokeWidth="80"
            opacity="0.3"
          />
        </svg>

        {/* Cover Text - Layered */}
        <div className="absolute inset-0 flex flex-col justify-between items-center py-12 px-6 text-center pointer-events-none">
          {/* Top quote */}
          <div className="animate-fade-in">
            <p className="text-[#e5c158] text-xs tracking-widest font-serif uppercase font-light">
              Some journey's don't change the world,
              <br />
              they change you.
            </p>
          </div>

          {/* Main content area */}
          <div className="space-y-6 animate-fade-in-delayed">
            {/* Main title */}
            <div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#d4af37] drop-shadow-2xl"
                style={{ textShadow: '0 0 20px rgba(212, 175, 55, 0.4)' }}>
                THE ART OF
                <br />
                UNDERSTANDING
              </h1>
            </div>

            {/* Subtitle */}
            <div>
              <h2 className="text-2xl md:text-4xl font-serif text-[#e5c158] italic">
                The Journey of Shadow
              </h2>
            </div>

            {/* Lower middle points */}
            <div className="space-y-3 py-8">
              <p className="text-[#d4af37] text-sm font-serif tracking-wide">
                A journey into the silence.
              </p>
              <p className="text-[#d4af37] text-sm font-serif tracking-wide">
                A return to the self.
              </p>
              <p className="text-[#d4af37] text-sm font-serif tracking-wide">
                A life lived with awareness.
              </p>
            </div>
          </div>

          {/* Author and Button section */}
          <div className="space-y-8 animate-fade-in-delayed-2">
            <p className="text-[#e5c158] text-sm tracking-widest font-serif uppercase font-light">
              S A K S H I   P A T I D A R
            </p>

            {/* BEGIN THE JOURNEY Button */}
            <button
              onClick={handleBeginJourney}
              className="px-8 py-3 border-2 border-[#d4af37] text-[#d4af37] font-serif uppercase text-sm tracking-widest hover:bg-[#d4af37] hover:text-[#121110] transition-all duration-500 relative group overflow-hidden pointer-events-auto"
              style={{
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.3), inset 0 0 20px rgba(212, 175, 55, 0.1)'
              }}
            >
              <span className="relative z-10">Begin the Journey</span>
              <div className="absolute inset-0 bg-[#d4af37] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
          }

          .animate-fade-in-delayed {
            animation: fadeIn 1s ease-out 0.3s forwards;
            opacity: 0;
          }

          .animate-fade-in-delayed-2 {
            animation: fadeIn 1s ease-out 0.6s forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    );
  }

  // Reading View
  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#121110] to-[#1a1816] flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed md:static left-0 top-0 h-full w-80 bg-black/40 backdrop-blur-md border-r-2 border-[#d4af37]/30 transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-serif text-[#d4af37]">Chapters</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-[#d4af37] hover:text-[#e5c158]"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-3 flex-1 overflow-y-auto">
            {[1, 3].map((chapterNum) => (
              <button
                key={chapterNum}
                onClick={() => handleChapterClick(chapterNum)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-serif text-sm ${
                  currentChapter === chapterNum
                    ? 'bg-[#d4af37]/20 border-l-2 border-[#d4af37] text-[#e5c158]'
                    : 'text-[#d4af37] hover:text-[#e5c158] hover:bg-[#d4af37]/10'
                }`}
              >
                <div className="font-semibold">Chapter {chapterNum}</div>
                <div className="text-xs opacity-80 mt-1">{chapters[chapterNum].title}</div>
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-[#d4af37]/20 text-center text-xs text-[#d4af37]/60 font-serif">
            {currentPage + 1} of {totalPages}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        {/* Top controls */}
        <div className="w-full flex items-center justify-between mb-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-[#d4af37] hover:text-[#e5c158] transition-colors"
          >
            <Menu size={28} />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-2xl md:text-3xl font-serif text-[#d4af37] truncate px-4">
              {currentChapterData.title}
            </h1>
          </div>

          <div className="w-12" /> {/* Spacer for alignment */}
        </div>

        {/* Book viewer container */}
        <div className="flex-1 flex items-center justify-center w-full max-w-4xl">
          {/* Left arrow */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="mr-4 text-[#d4af37] hover:text-[#e5c158] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Book pages container */}
          <div className="flex-1 aspect-video flex gap-4 md:gap-8 perspective">
            {/* Left page */}
            <div
              className={`flex-1 bg-[#fbf9f3] rounded-sm shadow-2xl p-8 md:p-10 overflow-hidden relative transition-transform duration-500 ${
                isFlipping ? 'transform -rotateY-180' : ''
              }`}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.02) 0%, transparent 2%, transparent 98%, rgba(0,0,0,0.1) 100%)`,
                perspective: '1200px'
              }}
            >
              <div className="flex flex-col h-full justify-between">
                <div className="flex-1 overflow-y-auto pr-2">
                  {currentPage < pages.length && (
                    <div className="space-y-4">
                      {pages[currentPage].split('\n\n').map((paragraph, idx) => (
                        <p
                          key={idx}
                          className={`font-serif leading-relaxed text-[#1a1816] ${
                            paragraph.includes('---') 
                              ? 'text-center italic text-[#d4af37] my-6 text-sm' 
                              : 'text-base md:text-lg'
                          }`}
                          style={{ fontSize: paragraph.includes('---') ? '14px' : '18px' }}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Page number - Left page (even) */}
                <div className="text-center text-sm text-[#1a1816] opacity-50 mt-4">
                  {(currentPage * 2) + 1}
                </div>
              </div>
            </div>

            {/* Right page */}
            <div
              className={`flex-1 bg-[#fbf9f3] rounded-sm shadow-2xl p-8 md:p-10 overflow-hidden relative transition-transform duration-500 ${
                isFlipping ? 'transform -rotateY-180' : ''
              }`}
              style={{
                backgroundImage: `linear-gradient(to left, rgba(0,0,0,0.02) 0%, transparent 2%, transparent 98%, rgba(0,0,0,0.1) 100%)`,
                perspective: '1200px'
              }}
            >
              <div className="flex flex-col h-full justify-between">
                <div className="flex-1 overflow-y-auto pr-2">
                  {currentPage + 1 < pages.length && (
                    <div className="space-y-4">
                      {pages[currentPage + 1].split('\n\n').map((paragraph, idx) => (
                        <p
                          key={idx}
                          className={`font-serif leading-relaxed text-[#1a1816] ${
                            paragraph.includes('---') 
                              ? 'text-center italic text-[#d4af37] my-6 text-sm' 
                              : 'text-base md:text-lg'
                          }`}
                          style={{ fontSize: paragraph.includes('---') ? '14px' : '18px' }}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Page number - Right page (odd) */}
                <div className="text-center text-sm text-[#1a1816] opacity-50 mt-4">
                  {(currentPage * 2) + 2}
                </div>
              </div>
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            className="ml-4 text-[#d4af37] hover:text-[#e5c158] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Page info */}
        <div className="mt-6 text-center text-sm text-[#d4af37] font-serif">
          Chapter {currentChapter} • Page {currentPage + 1} of {totalPages}
        </div>
      </div>
    </div>
  );
};

export default EbookViewer;