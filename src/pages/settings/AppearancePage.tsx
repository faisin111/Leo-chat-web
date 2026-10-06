
import { Monitor, Sun, Moon } from 'lucide-react';

export const AppearancePage = () => {
  return (
    <div className="max-w-3xl w-full mx-auto p-8 overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Appearance</h1>
        <p className="text-slate-500">Customize how the application looks on your device.</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Theme</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* System */}
            <div className="flex flex-col items-center p-4 border-2 border-primary rounded-xl cursor-pointer bg-primary/5">
              <Monitor className="w-8 h-8 mb-3 text-primary" />
              <span className="font-medium text-primary">System</span>
            </div>
            
            {/* Light */}
            <div className="flex flex-col items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
              <Sun className="w-8 h-8 mb-3 text-slate-400" />
              <span className="font-medium text-slate-600">Light</span>
            </div>
            
            {/* Dark */}
            <div className="flex flex-col items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 bg-slate-900 text-slate-400">
              <Moon className="w-8 h-8 mb-3 text-slate-300" />
              <span className="font-medium text-slate-300">Dark</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Accent Color</h2>
          <div className="flex space-x-4">
            <div className="w-10 h-10 rounded-full bg-red-500 ring-4 ring-red-100 cursor-pointer"></div>
            <div className="w-10 h-10 rounded-full bg-blue-500 cursor-pointer"></div>
            <div className="w-10 h-10 rounded-full bg-green-500 cursor-pointer"></div>
            <div className="w-10 h-10 rounded-full bg-purple-500 cursor-pointer"></div>
            <div className="w-10 h-10 rounded-full bg-orange-500 cursor-pointer"></div>
          </div>
        </section>
      </div>
    </div>
  );
};
