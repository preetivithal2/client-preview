// "use client";

// import { useState, useEffect } from "react";
// import { getAllRegulations } from "../../lib/firestore";
// import { Regulation } from "../../lib/types";

// export default function RegulatoryLibrary() {
//   const [regulations, setRegulations] = useState<Regulation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     fetchRegulations();
//   }, []);

//   const fetchRegulations = async () => {
//     setLoading(true);
//     try {
//       const data = await getAllRegulations();
//       setRegulations(data);
//     } catch (err) {
//       console.error("Failed to fetch regulations:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filtered = regulations.filter((reg) =>
//     reg.code.toLowerCase().includes(search.toLowerCase())
//   );

//   const getAllFiles = (reg: Regulation) => {
//     const files: { name: string; url: string }[] = [];
//     if (reg.attachment?.url) {
//       files.push({ name: reg.attachment.name || "Attachment", url: reg.attachment.url });
//     }
//     if (reg.files) {
//       reg.files.forEach((f) => {
//         if (!files.some((x) => x.url === f.url)) {
//           files.push({ name: f.fileName, url: f.url });
//         }
//       });
//     }
//     return files;
//   };

//   return (
//     <div className="min-h-screen bg-[var(--clr-bg-page)] p-4 sm:p-6 md:p-10 animate-fadeIn">
//       <div className="max-w-[1600px] mx-auto space-y-6">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--clr-text-primary)] flex items-center gap-3">
//               <span className="bg-gradient-to-r from-[var(--clr-text-primary)] to-[var(--clr-text-secondary)] bg-clip-text text-transparent">
//                 Regulatory Library
//               </span>
//               <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--clr-bg-tag)] text-[var(--clr-text-primary)] text-[10px] font-mono font-bold tracking-widest uppercase border border-[var(--clr-bg-tag-border)]">
//                 {filtered.length} Items
//               </span>
//             </h1>
//             <p className="text-sm text-[var(--clr-text-secondary)] font-mono mt-1">
//               Browse and view regulations and their attached documents.
//             </p>
//           </div>
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search regulations..."
//             className="w-full sm:w-64 px-4 py-2 border border-[var(--clr-border)] rounded-lg text-sm text-[var(--clr-text-primary)] bg-[var(--clr-bg-card)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition placeholder:text-[var(--clr-text-muted)]"
//           />
//         </div>

//         {/* Grid */}
//         {loading ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
//             {[1, 2, 3, 4, 5, 6].map((i) => (
//               <div key={i} className="bg-[var(--clr-bg-card)] border border-[var(--clr-border)] rounded-xl p-5 animate-pulse space-y-3">
//                 <div className="h-5 w-3/4 bg-[var(--clr-border)] rounded" />
//                 <div className="h-3 w-1/2 bg-[var(--clr-border)] rounded" />
//                 <div className="h-8 w-full bg-[var(--clr-border)] rounded-lg" />
//               </div>
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="text-center py-16">
//             <svg className="w-16 h-16 mx-auto text-[var(--clr-text-muted)] mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
//             </svg>
//             <p className="text-sm text-[var(--clr-text-muted)] font-mono">
//               {search ? "No regulations match your search." : "No regulations added yet."}
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
//             {filtered.map((reg) => {
//               const files = getAllFiles(reg);
//               return (
//                 <div
//                   key={reg.id}
//                   className="bg-[var(--clr-bg-card)] border border-[var(--clr-border)] rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col"
//                 >
//                   {/* Card Header */}
//                   <div className="p-5 border-b border-[var(--clr-border)] flex-1">
//                     <div className="flex items-start justify-between gap-3">
//                       <h3 className="text-sm font-bold text-[var(--clr-text-primary)] leading-snug">
//                         {reg.code}
//                       </h3>
//                       {files.length > 0 && (
//                         <span className="shrink-0 inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full bg-[var(--clr-bg-tag)] text-[var(--clr-text-primary)] text-[10px] font-mono font-bold border border-[var(--clr-bg-tag-border)]">
//                           {files.length}
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   {/* Files List */}
//                   {files.length > 0 ? (
//                     <div className="p-3 space-y-1.5 bg-[var(--clr-bg-page)]">
//                       {files.map((file, idx) => (
//                         <div
//                           key={idx}
//                           className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--clr-bg-card)] border border-[var(--clr-border)]"
//                         >
//                           {/* File icon */}
//                           <div className="w-8 h-8 rounded-lg bg-[var(--clr-bg-subtle)] flex items-center justify-center text-[var(--clr-text-secondary)] shrink-0">
//                             {file.url.match(/\.(jpg|jpeg|png|gif|webp|svg)/i) ? (
//                               <img src={file.url} alt="" className="w-full h-full rounded object-cover" />
//                             ) : file.url.match(/\.pdf/i) ? (
//                               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
//                               </svg>
//                             ) : (
//                               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
//                               </svg>
//                             )}
//                           </div>
//                           <span className="flex-1 min-w-0 text-xs text-[var(--clr-text-primary)] truncate">
//                             {file.name}
//                           </span>
//                           <a
//                             href={file.url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="p-1.5 text-[var(--clr-text-secondary)] hover:text-blue-600 rounded-full transition shrink-0 cursor-pointer"
//                             title="Open file"
//                           >
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
//                             </svg>
//                           </a>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="p-5 text-center text-xs text-[var(--clr-text-muted)] font-mono">
//                       No documents attached
//                     </div>
//                   )}

//                   {/* Footer */}
//                   <div className="px-5 py-3 border-t border-[var(--clr-border)] flex justify-between items-center">
//                     <span className="text-[10px] font-mono text-[var(--clr-text-muted)]">
//                       {files.length > 0 ? `${files.length} document${files.length > 1 ? "s" : ""}` : "No files"}
//                     </span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// app/regulatory-library/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getAllRegulations } from "../../lib/firestore";
import { Regulation } from "../../lib/types";

export default function RegulatoryLibraryPage() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        const data = await getAllRegulations();
        setRegulations(data);
      } catch (err: any) {
        console.error("Failed to fetch regulations:", err);
        setError(err.message || "Failed to load regulations");
      } finally {
        setLoading(false);
      }
    };
    fetchRegulations();
  }, []);

  const filteredRegulations = regulations.filter((reg) => {
    const term = searchTerm.toLowerCase();
    const codeMatch = reg.code.toLowerCase().includes(term);
    const descMatch = reg.description?.toLowerCase().includes(term);
    const fileNames = [
      reg.attachment?.name || "",
      ...(reg.files?.map((f) => f.fileName) || []),
    ];
    const fileMatch = fileNames.some((name) => name.toLowerCase().includes(term));
    return codeMatch || descMatch || fileMatch;
  });

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--clr-bg-page)] p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 bg-[var(--clr-border)] rounded-lg" />
            <div className="h-5 w-80 bg-[var(--clr-border)] rounded" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-[var(--clr-border)] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--clr-bg-page)] p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-[var(--clr-bg-red)] border border-[var(--clr-bg-red-border)] rounded-xl text-sm text-[var(--clr-text-red)]">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--clr-bg-page)] p-4 sm:p-6 md:p-10 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--clr-text-primary)] flex items-center gap-3">
            <span className="bg-gradient-to-r from-[var(--clr-text-primary)] to-[var(--clr-text-primary)] bg-clip-text text-transparent">
              Regulatory Library
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--clr-bg-accent)]/10 text-[var(--clr-text-primary)] text-[10px] font-mono font-bold tracking-widest uppercase border border-[var(--clr-ring-solid)]/10">
              {regulations.length} Regulations
            </span>
          </h1>
          <p className="text-sm text-[var(--clr-text-secondary)] font-mono mt-1 tracking-wide">
            Access international maritime regulations for quick reference during audits and inspections.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search regulations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-[var(--clr-border)] rounded-xl text-sm bg-[var(--clr-bg-card)] text-[var(--clr-text-primary)] placeholder:text-[var(--clr-text-muted)] focus:ring-2 focus:ring-[var(--clr-ring)] focus:border-[var(--clr-ring-solid)] transition"
            />
            <svg
              className="absolute left-3 top-3 w-4 h-4 text-[var(--clr-text-muted)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z"
              />
            </svg>
          </div>
        </div>

        {/* Regulations List */}
        {filteredRegulations.length === 0 ? (
          <div className="text-center py-16 text-[var(--clr-text-muted)] font-mono text-sm">
            {searchTerm
              ? "No regulations match your search."
              : "No regulations added yet. Add some in the Manage Regulations section."}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRegulations.map((reg) => {
              // ── Collect all attachments (supports both `attachments` array and single `attachment`) ──
              const fileList: { name: string; url: string }[] = [];
              if (reg.attachment?.url) {
                fileList.push({ name: reg.attachment.name || "Attachment", url: reg.attachment.url });
              }
              if (reg.files) {
                reg.files.forEach((f) => {
                  if (!fileList.some((x) => x.url === f.url)) {
                    fileList.push({ name: f.fileName, url: f.url });
                  }
                });
              }

              return (
                <div
                  key={reg.id}
                  className="bg-[var(--clr-bg-card)] rounded-xl border border-[var(--clr-border)] p-5 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {/* Regulation Name as Heading */}
                  <h3 className="text-md font-bold text-[var(--clr-text-primary)] pb-2 border-b border-[var(--clr-border)]">
                    {reg.code}
                  </h3>
                  {reg.description && (
                    <p className="text-sm text-[var(--clr-text-secondary)] mt-2 mb-3 leading-relaxed">
                      {reg.description}
                    </p>
                  )}

                  {/* All Attachments */}
                  {fileList.length === 0 ? (
                    <p className="text-sm text-[var(--clr-text-muted)] italic">
                      No documents attached
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {fileList.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[var(--clr-bg-card-hover)] transition-colors group"
                        >
                          <span className="text-sm font-medium text-[var(--clr-text-primary)] truncate flex-1">
                            {idx + 1}. {file.name || `Document ${idx + 1}`}
                          </span>
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <button
                              onClick={() => handleView(file.url)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-[var(--clr-bg-accent)] hover:bg-[var(--clr-bg-accent-hover)] rounded-lg transition"
                            >
                              View
                            </button>
                            <button
                              onClick={() =>
                                handleDownload(file.url, file.name || "document")
                              }
                              className="px-3 py-1 text-xs font-semibold text-[var(--clr-text-secondary)] border border-[var(--clr-border)] hover:bg-[var(--clr-bg-card-hover)] rounded-lg transition"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}