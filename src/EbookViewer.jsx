import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Upload,
  X,
  BookOpen,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

const PAGE_LAYOUT = {
  maxLines: 21,
  maxCharsPerLine: 44,
};

const chapterPattern = /^\s*chapter\s+([\divxlc]+|\d+)(?:[:\-\.]\s*(.*))?\s*$/i;

const estimateLines = (text, maxCharsPerLine) => {
  if (!text?.trim()) return [];

  const words = text.trim().split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    if (`${current} ${word}`.length <= maxCharsPerLine) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
};

const parsePdf = async (file, onProgress) => {
  const bytes = await file.arrayBuffer();
  const loadingTask = getDocument({ data: bytes });
  const pdf = await loadingTask.promise;
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const lines = [];
    let line = '';

    for (const item of textContent.items) {
      if (!('str' in item)) continue;
      const nextText = item.str?.trim();
      if (!nextText) continue;

      line = `${line}${line ? ' ' : ''}${nextText}`;
      if (item.hasEOL) {
        lines.push(line.trim());
        line = '';
      }
    }

    if (line.trim()) {
      lines.push(line.trim());
    }

    pageTexts.push(lines.join('\n').trim());
    onProgress(Math.round((pageNumber / pdf.numPages) * 100));
  }

  return pageTexts;
};

const buildBookContent = (pageTexts) => {
  const mergedText = pageTexts.filter(Boolean).join('\n\n');
  const rawParagraphs = mergedText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  if (rawParagraphs.length === 0) {
    throw new Error('No readable text was found in this PDF.');
  }

  const chapters = [];

  rawParagraphs.forEach((paragraph, paragraphIndex) => {
    const lines = paragraph.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return;

    const firstLine = lines[0];
    const chapterMatch = firstLine.match(chapterPattern);

    if (!chapterMatch) return;

    const chapterNumber = chapterMatch[1]?.toUpperCase();
    const titleCandidate = chapterMatch[2]?.trim();
    const nextLineTitle = lines[1] || '';

    chapters.push({
      id: `${chapterNumber}-${paragraphIndex}`,
      label: `Chapter ${chapterNumber}`,
      title: titleCandidate || nextLineTitle || `Chapter ${chapterNumber}`,
      paragraphIndex,
      startPage: 0,
    });
  });

  if (!chapters.length) {
    chapters.push({
      id: 'full-book',
      label: 'Book Start',
      title: 'Book Start',
      paragraphIndex: 0,
      startPage: 0,
    });
  }

  const chapterByParagraph = new Map(chapters.map((chapter) => [chapter.paragraphIndex, chapter]));
  const pages = [];
  let activeBlocks = [];
  let usedLines = 0;

  const pushPage = () => {
    if (!activeBlocks.length) return;
    pages.push(activeBlocks);
    activeBlocks = [];
    usedLines = 0;
  };

  rawParagraphs.forEach((paragraph, paragraphIndex) => {
    const isQuote = /^".*"$/.test(paragraph) || /^“.*”$/.test(paragraph);
    const lines = estimateLines(paragraph, PAGE_LAYOUT.maxCharsPerLine);
    const paragraphType = chapterByParagraph.has(paragraphIndex)
      ? 'chapter'
      : isQuote
        ? 'quote'
        : 'paragraph';

    if (chapterByParagraph.has(paragraphIndex)) {
      chapterByParagraph.get(paragraphIndex).startPage = pages.length;
    }

    let cursor = 0;
    while (cursor < lines.length) {
      const remainingPageCapacity = PAGE_LAYOUT.maxLines - usedLines;
      const extraSpacing = usedLines ? 1 : 0;

      if (remainingPageCapacity <= extraSpacing) {
        pushPage();
        continue;
      }

      const chunkSize = Math.min(lines.length - cursor, remainingPageCapacity - extraSpacing);
      const chunkLines = lines.slice(cursor, cursor + chunkSize);

      if (!chunkLines.length) {
        pushPage();
        continue;
      }

      activeBlocks.push({
        type: paragraphType,
        text: chunkLines.join(' '),
      });

      usedLines += chunkLines.length + (usedLines ? 1 : 0);
      cursor += chunkSize;

      if (usedLines >= PAGE_LAYOUT.maxLines) {
        pushPage();
      }
    }
  });

  pushPage();

  if (!pages.length) {
    throw new Error('Unable to paginate this PDF.');
  }

  return { pages, chapters };
};

const EbookViewer = () => {
  const [view, setView] = useState('landing');
  const [isZooming, setIsZooming] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [error, setError] = useState('');

  const [bookTitle, setBookTitle] = useState('Uploaded Book');
  const [chapters, setChapters] = useState([]);
  const [pages, setPages] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const rapidFlipRef = useRef(null);
  const totalSpreads = useMemo(() => Math.max(1, Math.ceil(pages.length / 2)), [pages.length]);

  useEffect(() => {
    return () => {
      if (rapidFlipRef.current) {
        clearInterval(rapidFlipRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (view !== 'reading') return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        setCurrentSpread((prev) => Math.min(prev + 1, totalSpreads - 1));
      }
      if (event.key === 'ArrowLeft') {
        setCurrentSpread((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view, totalSpreads]);

  const activeChapterId = useMemo(() => {
    const activePage = currentSpread * 2;
    const sortedChapters = [...chapters].sort((a, b) => a.startPage - b.startPage);
    let active = sortedChapters[0]?.id;

    sortedChapters.forEach((chapter) => {
      if (chapter.startPage <= activePage) {
        active = chapter.id;
      }
    });

    return active;
  }, [chapters, currentSpread]);

  const openBook = () => {
    setIsZooming(true);
    setTimeout(() => {
      setView('reading');
      setIsZooming(false);
    }, 800);
  };

  const handlePdfUpload = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') || file.type && file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setError('');
    setParseProgress(0);
    setIsParsing(true);

    try {
      const pageTexts = await parsePdf(file, setParseProgress);
      const { pages: builtPages, chapters: builtChapters } = buildBookContent(pageTexts);

      setBookTitle(file.name.replace(/\.pdf$/i, ''));
      setPages(builtPages);
      setChapters(builtChapters);
      setCurrentSpread(0);
      openBook();
    } catch (uploadError) {
      setError(uploadError?.message || 'Failed to parse this PDF.');
    } finally {
      setIsParsing(false);
    }
  };

  const stopRapidFlip = () => {
    if (rapidFlipRef.current) {
      clearInterval(rapidFlipRef.current);
      rapidFlipRef.current = null;
    }
  };

  const flipToSpread = (nextSpread) => {
    setCurrentSpread((prev) => {
      const clamped = Math.max(0, Math.min(nextSpread, totalSpreads - 1));
      if (clamped !== prev) {
        setIsFlipping(true);
        setTimeout(() => setIsFlipping(false), 260);
      }
      return clamped;
    });
  };

  const handleChapterSelect = (chapter) => {
    stopRapidFlip();
    const targetSpread = Math.floor(chapter.startPage / 2);

    rapidFlipRef.current = setInterval(() => {
      setCurrentSpread((prev) => {
        if (prev === targetSpread) {
          stopRapidFlip();
          return prev;
        }
        return prev < targetSpread ? prev + 1 : prev - 1;
      });
    }, 40);

    setSidebarOpen(false);
  };

  const onDrop = async (event) => {
    event.preventDefault();
    setIsDragActive(false);
    await handlePdfUpload(event.dataTransfer.files?.[0]);
  };

  const leftPage = pages[currentSpread * 2] || [];
  const rightPage = pages[currentSpread * 2 + 1] || [];

  if (view === 'landing') {
    return (
      <div
        className={`w-full h-screen relative overflow-hidden bg-gradient-to-b from-[#121110] via-[#1a1816] to-black transition-all duration-700 ${
          isZooming ? 'scale-125 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(244,217,87,0.08) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
              <stop offset="40%" stopColor="#e5c158" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffd700" stopOpacity="0.95" />
            </linearGradient>
            <filter id="coverGlow">
              <feGaussianBlur stdDeviation="9" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M 500,120 Q 430,320 480,460 Q 530,620 500,1000"
            fill="none"
            stroke="url(#pathGlow)"
            strokeWidth="52"
            filter="url(#coverGlow)"
            opacity="0.95"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-6">
          <div className="space-y-3 pointer-events-none">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#d4af37] tracking-wide">
              THE ART OF UNDERSTANDING
            </h1>
            <h2 className="text-xl md:text-3xl font-serif italic text-[#e5c158]">THE JOURNEY OF SHADOW</h2>
          </div>

          <label
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={onDrop}
            className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-8 md:p-10 backdrop-blur-sm transition-all duration-300 cursor-pointer ${
              isDragActive
                ? 'border-[#ffd700] bg-[#d4af37]/20 shadow-[0_0_40px_rgba(212,175,55,0.35)]'
                : 'border-[#d4af37]/60 bg-black/35 hover:bg-black/45 hover:border-[#e5c158]'
            }`}
          >
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => handlePdfUpload(event.target.files?.[0])}
              disabled={isParsing}
            />

            <div className="flex flex-col items-center gap-4 text-[#fcfaf2]">
              {isParsing ? (
                <Loader2 className="animate-spin text-[#ffd700]" size={36} />
              ) : (
                <Upload size={36} className="text-[#ffd700]" />
              )}

              <div className="space-y-2">
                <p className="font-serif text-lg md:text-2xl text-[#e5c158]">Upload PDF & Begin</p>
                <p className="text-sm text-[#fcfaf2]/80">Drag and drop your book, or click to browse</p>
              </div>

              {isParsing && (
                <div className="w-full max-w-sm">
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#d4af37] to-[#ffd700] transition-all duration-300"
                      style={{ width: `${parseProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#e5c158]">Extracting text... {parseProgress}%</p>
                </div>
              )}

              {!!error && (
                <div className="flex items-center gap-2 text-red-300 text-sm">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#121110] to-[#1a1816] flex overflow-hidden">
      <aside
        className={`fixed md:static left-0 top-0 h-full w-80 bg-black/40 backdrop-blur-md border-r border-[#d4af37]/40 z-40 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif text-[#d4af37]">Chapters</h2>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[#d4af37]">
              <X size={22} />
            </button>
          </div>

          <nav className="space-y-2 overflow-y-auto flex-1">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => handleChapterSelect(chapter)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  chapter.id === activeChapterId
                    ? 'bg-[#d4af37]/20 border-l-2 border-[#d4af37] text-[#e5c158]'
                    : 'text-[#d4af37] hover:bg-[#d4af37]/10'
                }`}
              >
                <p className="font-serif text-sm font-semibold">{chapter.label}</p>
                <p className="text-xs opacity-90 mt-1">{chapter.title}</p>
              </button>
            ))}
          </nav>

          <p className="mt-6 pt-4 border-t border-[#d4af37]/20 text-xs text-[#d4af37]/70 font-serif">
            Spread {currentSpread + 1} / {totalSpreads}
          </p>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="w-full flex items-center justify-between mb-5">
          <button onClick={() => setSidebarOpen((open) => !open)} className="md:hidden text-[#d4af37]">
            <Menu size={26} />
          </button>
          <h1 className="flex-1 px-3 text-center text-[#e5c158] font-serif text-xl md:text-2xl truncate">
            {bookTitle}
          </h1>
          <div className="w-8" />
        </div>

        <div className="w-full max-w-6xl flex items-center gap-2 md:gap-4">
          <button
            onClick={() => flipToSpread(currentSpread - 1)}
            disabled={currentSpread === 0}
            className="text-[#d4af37] hover:text-[#e5c158] disabled:opacity-30"
            aria-label="Previous spread"
          >
            <ChevronLeft size={32} />
          </button>

          <section
            className={`flex-1 max-w-5xl mx-auto bg-[#fcfaf2] rounded-md shadow-2xl overflow-hidden transition-transform duration-300 ${
              isFlipping ? 'scale-[0.992]' : 'scale-100'
            }`}
            style={{ aspectRatio: '10 / 8' }}
          >
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 relative">
              <div className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 hidden md:block bg-gradient-to-r from-black/20 via-black/35 to-black/20" />

              {[leftPage, rightPage].map((pageBlocks, index) => (
                <article
                  key={index}
                  className={`h-full p-5 md:p-8 overflow-hidden ${
                    index === 1 ? 'border-t md:border-t-0 md:border-l border-black/10' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin: index === 0 ? 'right center' : 'left center',
                    transform: isFlipping
                      ? index === 0
                        ? 'rotateY(-10deg)'
                        : 'rotateY(10deg)'
                      : 'rotateY(0deg)',
                    transition: 'transform 280ms ease',
                  }}
                >
                  <div className="h-full flex flex-col justify-between">
                    <div className="space-y-4 overflow-y-auto pr-1">
                      {pageBlocks.length ? (
                        pageBlocks.map((block, blockIndex) => {
                          if (block.type === 'quote') {
                            return (
                              <div key={blockIndex} className="text-center text-[#715419]">
                                <p className="text-xs tracking-[0.2em]">---♦---</p>
                                <p className="italic leading-relaxed text-[18px]">{block.text}</p>
                                <p className="text-xs tracking-[0.2em]">---♦---</p>
                              </div>
                            );
                          }

                          if (block.type === 'chapter') {
                            return (
                              <h3
                                key={blockIndex}
                                className="font-serif uppercase tracking-wide text-[#2a2313] text-[18px] leading-relaxed font-semibold"
                              >
                                {block.text}
                              </h3>
                            );
                          }

                          return (
                            <p key={blockIndex} className="font-serif text-[#1a1816] text-[18px] leading-relaxed">
                              {block.text}
                            </p>
                          );
                        })
                      ) : (
                        <p className="font-serif text-[#1a1816]/40 italic">No content on this page.</p>
                      )}
                    </div>

                    <p className="text-center text-xs text-black/45 mt-4">{currentSpread * 2 + index + 1}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <button
            onClick={() => flipToSpread(currentSpread + 1)}
            disabled={currentSpread >= totalSpreads - 1}
            className="text-[#d4af37] hover:text-[#e5c158] disabled:opacity-30"
            aria-label="Next spread"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 text-[#d4af37] font-serif text-sm">
          <BookOpen size={16} />
          <span>
            Pages {currentSpread * 2 + 1}-{Math.min(currentSpread * 2 + 2, pages.length)} of {pages.length}
          </span>
        </div>
      </main>
    </div>
  );
};

export default EbookViewer;
