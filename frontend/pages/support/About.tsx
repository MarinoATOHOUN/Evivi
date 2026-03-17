
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe, Heart, Users, ShieldCheck } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

const About: React.FC = () => {
  const navigate = useNavigate();

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
        <h1 className="text-xl font-bold text-gray-900">About Évivi</h1>
      </header>

      <div className="px-6 py-10 space-y-12 max-w-2xl mx-auto pb-32">
        {/* Hero Section */}
        <section className="text-center">
          <div className="w-20 h-20 bg-[#E85D1A] rounded-3xl flex items-center justify-center rotate-45 mx-auto mb-10 shadow-xl shadow-orange-500/20">
             <div className="w-10 h-10 bg-white -rotate-45 rounded-md"></div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Notre raison d’être</h2>
          <p className="text-gray-600 leading-relaxed font-medium">
            Évivi est née d’un constat simple. La gastronomie africaine est l’une des plus riches et des plus diverses au monde, pourtant elle reste largement invisible dans l’espace numérique mondial.
          </p>
          <p className="text-gray-600 leading-relaxed font-medium mt-4">
            Nos plats existent. Nos savoir-faire existent. Nos histoires culinaires existent. Mais les infrastructures numériques qui diffusent, classent et valorisent les contenus ne sont pas pensées pour nous.
          </p>
          <p className="text-[#E85D1A] font-black text-xl mt-6 tracking-tight">Évivi a été créée pour changer cela.</p>
        </section>

        {/* What is Evivi */}
        <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Qu’est-ce qu’Évivi ?</h2>
          <p className="text-gray-600 leading-relaxed font-medium mb-6">
            Évivi est une <span className="text-[#E85D1A] font-bold">plateforme sociale dédiée à la gastronomie africaine</span>.
          </p>
          <div className="space-y-4">
            {[
              "découvrir des plats africains,",
              "partager des recettes et des savoir-faire,",
              "donner de la visibilité aux cuisines du continent,",
              "créer des liens autour de la nourriture."
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Heart size={12} className="text-[#E85D1A] fill-[#E85D1A]" />
                </div>
                <span className="text-gray-700 font-semibold">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 leading-relaxed font-medium mt-8 border-t border-gray-50 pt-6">
            Évivi fonctionne comme un réseau social, mais avec une mission claire. <span className="font-bold text-gray-900">Mettre la cuisine africaine au centre.</span>
          </p>
        </section>

        {/* Vision */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Globe size={24} className="text-[#E85D1A]" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Notre vision</h2>
          </div>
          <p className="text-gray-600 leading-relaxed font-medium">
            Nous croyons que la cuisine est une porte d’entrée universelle vers la culture. À travers Évivi, nous voulons :
          </p>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <span className="text-[#E85D1A] font-black">•</span>
              <span className="text-gray-700 font-medium">préserver et transmettre le patrimoine culinaire africain,</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#E85D1A] font-black">•</span>
              <span className="text-gray-700 font-medium">permettre aux plats africains de traverser les frontières,</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#E85D1A] font-black">•</span>
              <span className="text-gray-700 font-medium">construire une mémoire numérique collective de notre gastronomie.</span>
            </li>
          </ul>
          <p className="bg-orange-50 p-6 rounded-3xl text-[#E85D1A] font-bold text-center italic">
            "À long terme, Évivi ambitionne de devenir la référence mondiale de la gastronomie africaine."
          </p>
        </section>

        {/* Differences */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ce qui rend Évivi différente</h2>
          <div className="grid gap-4">
            {[
              { icon: <Globe size={18} />, text: "Une plateforme entièrement dédiée à la cuisine africaine" },
              { icon: <Heart size={18} />, text: "Des recettes mises en valeur, pas noyées dans des contenus généralistes" },
              { icon: <Users size={18} />, text: "Une approche communautaire et sociale" },
              { icon: <ShieldCheck size={18} />, text: "Une vision tournée vers la souveraineté culturelle numérique" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-[#E85D1A]">{item.icon}</div>
                <span className="text-sm font-bold text-gray-800">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Final Statement */}
        <section className="pt-10 text-center space-y-4 border-t border-gray-100">
           <h3 className="text-xl font-black text-gray-900">Notre engagement</h3>
           <p className="text-gray-500 font-medium leading-relaxed">
             Nous nous engageons à construire Évivi de manière responsable, inclusive et respectueuse des cultures africaines. Chaque recette partagée est une histoire. Chaque plat est un héritage.
           </p>
        </section>
      </div>
    </PageWrapper>
  );
};

export default About;
