
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

const Terms: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Introduction",
      content: "Bienvenue sur Évivi. En accédant à la plateforme Évivi et en créant un compte, vous acceptez pleinement et sans réserve les présentes Conditions d’utilisation. Si vous n’acceptez pas ces conditions, vous ne devez pas utiliser la plateforme."
    },
    {
      title: "2. Objet du service",
      content: "Évivi est une plateforme sociale permettant aux utilisateurs de publier et consulter des recettes de plats africains, interagir via des likes, commentaires et abonnements, et découvrir des contenus culinaires. Évivi se réserve le droit de faire évoluer les fonctionnalités à tout moment."
    },
    {
      title: "3. Création de compte",
      content: "Pour utiliser certaines fonctionnalités, l’utilisateur doit créer un compte. L’utilisateur s’engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants. Évivi ne saurait être tenue responsable d’une utilisation non autorisée du compte."
    },
    {
      title: "4. Contenu publié par les utilisateurs",
      content: "Les utilisateurs sont seuls responsables des contenus qu’ils publient. Ils garantissent détenir les droits nécessaires et ne pas publier de contenu illégal ou offensant. Évivi se réserve le droit de retirer tout contenu inapproprié."
    },
    {
      title: "5. Droits d’utilisation",
      content: "En publiant du contenu, l’utilisateur accorde à la plateforme une licence non exclusive pour afficher et promouvoir ce contenu. L’utilisateur reste propriétaire de son contenu."
    },
    {
      title: "6. Comportement des utilisateurs",
      content: "Il est interdit d’utiliser Évivi pour diffuser des contenus haineux, usurper l’identité d’autrui ou perturber le fonctionnement de la plateforme. Tout manquement peut entraîner la suppression du compte."
    },
    {
      title: "7. Responsabilité",
      content: "Évivi fournit le service en l’état sans garantie de disponibilité continue. La plateforme ne peut être tenue responsable des dommages indirects liés à l’utilisation du service."
    },
    {
      title: "8. Protection des données",
      content: "Évivi attache une grande importance à la protection des données personnelles. Les données sont utilisées uniquement pour le fonctionnement de la plateforme et ne sont pas revendues."
    }
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
        <h1 className="text-xl font-bold text-gray-900">Terms of Service</h1>
      </header>

      <div className="px-6 py-10 max-w-2xl mx-auto space-y-10 pb-32">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#E85D1A] shadow-sm border border-orange-50">
            <FileText size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Legal Notice</h2>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Last updated: June 2024</p>
          </div>
        </div>

        {sections.map((section, idx) => (
          <section key={idx} className="space-y-3">
            <h3 className="text-lg font-black text-gray-900">{section.title}</h3>
            <p className="text-gray-600 leading-relaxed font-medium text-[15px]">
              {section.content}
            </p>
          </section>
        ))}

        <div className="pt-8 border-t border-gray-100 space-y-4">
          <h3 className="text-lg font-black text-gray-900">11. Contact</h3>
          <p className="text-gray-600 font-medium">
            Pour toute question concernant Évivi ou les présentes Conditions d’utilisation, vous pouvez nous contacter via la plateforme.
          </p>
          <button className="bg-[#E85D1A] text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-orange-900/10 active:scale-95 transition-transform">
            Contact Us
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Terms;
