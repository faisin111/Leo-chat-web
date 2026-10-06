import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Search, ShieldCheck, ArrowLeft, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NewGroupPage = () => {
  return (
    <div className="flex h-full w-full bg-slate-50">
      {/* Create Group Sidebar */}
      <aside className="w-[300px] border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6">
          <Link to="/app/people" className="flex items-center text-xs text-slate-500 hover:text-slate-900 mb-6 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to conversations
          </Link>
          <h2 className="text-2xl font-semibold mb-2">Create a group</h2>
          <p className="text-slate-500 text-sm mb-8">Set up the space, then choose the people who belong.</p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mr-3 mt-0.5">✓</div>
              <div>
                <p className="font-semibold text-sm">Group details</p>
                <p className="text-xs text-slate-500">Complete</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
              <div>
                <p className="font-semibold text-sm text-primary">Select members</p>
                <p className="text-xs text-primary/70">In progress</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
              <div>
                <p className="font-semibold text-sm text-slate-400">Review & create</p>
                <p className="text-xs text-slate-400">Next</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-6">
          <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-start">
            <ShieldCheck className="w-4 h-4 text-green-600 mr-2 shrink-0 mt-0.5" />
            <p className="text-xs text-green-800 leading-relaxed">Group content is visible only to current members.</p>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto flex">
          <div className="flex-1 pr-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step 2 of 3</span>
              <div className="flex items-center space-x-3">
                <Button variant="outline" className="rounded-full shadow-sm">Save draft</Button>
                <Button className="rounded-full shadow-sm px-6">Continue →</Button>
              </div>
            </div>
            <h1 className="text-3xl font-semibold mb-2">Select members</h1>
            <p className="text-slate-500 text-sm mb-8">Invite at least one person. You'll be assigned the OWNER role.</p>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-9 h-12 bg-slate-50 rounded-xl border-slate-200" placeholder="Search people by name, email or @username" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-slate-400 text-[10px] font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-slate-200">⌘</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200">K</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <div className="flex space-x-6 text-sm font-medium text-slate-500">
                  <button className="text-slate-900 bg-slate-900 text-white px-3 py-1 rounded-full text-xs">Suggested</button>
                  <button className="hover:text-slate-900 py-1">Recent</button>
                  <button className="hover:text-slate-900 py-1">All people</button>
                </div>
                <span className="text-xs font-semibold text-primary">4 selected</span>
              </div>

              <div className="space-y-2">
                <SelectableUser initials="MC" name="Maya Chen" role="Design systems · @mayac" selected />
                <SelectableUser initials="JL" name="Jamie Lee" role="Research · @jamielee" selected />
                <SelectableUser initials="NK" name="Nina Kapoor" role="Product design · @nina" selected />
                <SelectableUser initials="TB" name="Theo Bennett" role="Engineering · @theob" selected />
                <SelectableUser initials="MA" name="Marco Alvarez" role="Engineering · @marcoa" selected={false} color="bg-indigo-100 text-indigo-700" />
                <SelectableUser initials="SM" name="Sofia Martins" role="Operations · @sofiam" selected={false} color="bg-pink-100 text-pink-700" />
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span>Showing 6 of 248 people</span>
                <div className="flex space-x-2">
                  <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">&lt;</button>
                  <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">&gt;</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Preview Panel */}
          <div className="w-[340px] shrink-0">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Launch crew</h3>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wider mb-4">PRIVATE GROUP</span>
              <p className="text-xs text-slate-500 text-center mb-8 px-2">Coordination for the October product release.</p>

              <div className="w-full mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-900">Selected · 5</span>
                  <button className="text-[10px] font-bold text-primary uppercase">Clear</button>
                </div>
                
                <div className="space-y-3">
                  <SelectedMember initials="AS" name="Alex Rivera" role="OWNER" />
                  <SelectedMember initials="MC" name="Maya Chen" role="MEMBER" color="bg-green-100 text-green-700" removable />
                  <SelectedMember initials="JL" name="Jamie Lee" role="MEMBER" color="bg-yellow-100 text-yellow-700" removable />
                  <SelectedMember initials="NK" name="Nina Kapoor" role="MEMBER" color="bg-pink-100 text-pink-700" removable />
                  <SelectedMember initials="TB" name="Theo Bennett" role="MEMBER" color="bg-blue-100 text-blue-700" removable />
                </div>
              </div>

              <div className="w-full bg-slate-50 rounded-xl p-4 mb-6">
                <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-1">Group roles</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  OWNER controls the group and roles. ADMIN manages members. MEMBER participates in the conversation.
                </p>
              </div>

              <div className="w-full space-y-2">
                <Button className="w-full rounded-xl h-11 shadow-sm font-medium">Continue to review →</Button>
                <Button variant="ghost" className="w-full rounded-xl h-11 text-slate-500 hover:text-slate-900 font-medium">Back to group details</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

function SelectableUser({ initials, name, role, selected, color = 'bg-green-100 text-green-700' }: any) {
  return (
    <div className={`flex items-center p-3 rounded-xl border-2 transition-colors cursor-pointer ${selected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-slate-200 bg-white'}`}>
      <div className={`w-6 h-6 rounded border ${selected ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'} flex items-center justify-center mr-4 shrink-0`}>
        {selected && <span className="text-xs">✓</span>}
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-4 shrink-0 ${color}`}>
        {initials}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">{role}</p>
      </div>
      {selected && (
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">MEMBER</span>
      )}
    </div>
  );
}

function SelectedMember({ initials, name, role, removable = false, color = 'bg-primary/10 text-primary' }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${color}`}>
          {initials}
        </div>
        <span className="text-xs font-semibold text-slate-900">{name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role === 'OWNER' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
          {role}
        </span>
        {removable && <button className="text-slate-400 hover:text-red-500 text-xs">✕</button>}
      </div>
    </div>
  );
}
