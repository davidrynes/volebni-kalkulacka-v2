import dynamic from 'next/dynamic';

// Dynamický import komponenty s vypnutím SSR
const VolebniKalkulacka = dynamic(() => import('../components/volebni-kalkulacka'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <VolebniKalkulacka />
    </div>
  );
} 