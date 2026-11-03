import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SellForm from '@/components/listings/SellForm';

export default function NewListingPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#151515]">
      <Header />
      
      <main className="py-12 main-container">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tight mb-3 sm:text-5xl">Vendre un article</h1>
          <p className="text-black/50 font-medium">Donnez une seconde vie à vos vêtements en quelques clics.</p>
        </div>

        <SellForm />
      </main>

      <Footer />
    </div>
  );
}
