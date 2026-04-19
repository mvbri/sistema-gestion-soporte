import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../components/PageWrapper';
import { MainNavbar } from '../components/MainNavbar';
import { faqService, FrequentIssue } from '../services/faqService';
import { toast } from 'react-toastify';

export const FAQ: React.FC = () => {
  const [issues, setIssues] = useState<FrequentIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const response = await faqService.getPublicIssues();
        if (response.success) setIssues(response.data);
      } catch (err) {
        toast.error('Error al cargar la base de conocimientos');
      } finally {
        setLoading(false);
      }
    };
    loadIssues();
  }, []);

  const filteredIssues = issues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Preguntas Frecuentes</h1>
            <p className="text-lg text-slate-600">
              Encuentra soluciones rápidas a los problemas técnicos más comunes.
            </p>
          </div>

          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por problema o síntoma..."
                className="w-full p-4 pl-12 rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => setOpenId(openId === issue.id ? null : issue.id)}
                      className="w-full text-left p-5 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-semibold text-slate-800 text-lg">{issue.title}</span>
                      <span
                        className={`transform transition-transform ${openId === issue.id ? 'rotate-180' : ''}`}
                      >
                        ▼
                      </span>
                    </button>
                    {openId === issue.id && (
                      <div className="p-5 bg-slate-50 border-t border-slate-100 animate-fadeIn">
                        {issue.symptoms && (
                          <div className="mb-4">
                            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                              Síntomas
                            </h4>
                            <p className="text-slate-700">{issue.symptoms}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold uppercase text-sky-600 tracking-wider mb-1">
                            Solución Sugerida
                          </h4>
                          <div className="prose prose-slate max-w-none text-slate-700">
                            {issue.possible_solution}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500">No se encontraron resultados para tu búsqueda.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
};
