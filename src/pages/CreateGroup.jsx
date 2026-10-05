import { ArrowLeft, Check, Search, ChevronLeft, ChevronRight, X, Lock, Users } from 'lucide-react'

export default function CreateGroup() {
  return (
    <div className="flex-1 flex h-full">
      {/* Steps Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white p-8">
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to conversations
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create a group</h2>
        <p className="text-sm text-gray-500 mb-12">Set up the space, then choose the people who belong.</p>
        
        <div className="flex-1 space-y-8 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {/* Step 1 */}
          <div className="relative flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shadow-sm z-10 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div className="pt-1">
              <h3 className="font-semibold text-gray-900">Group details</h3>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="relative flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold shadow-sm z-10 border-2 border-brand-500 shrink-0">
              2
            </div>
            <div className="pt-1">
              <h3 className="font-semibold text-gray-900">Select members</h3>
              <p className="text-xs text-brand-600 font-medium">In progress</p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="relative flex items-start gap-4 opacity-50">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center font-bold shadow-sm z-10 shrink-0">
              3
            </div>
            <div className="pt-1">
              <h3 className="font-semibold text-gray-900">Review & create</h3>
              <p className="text-xs text-gray-500">Next</p>
            </div>
          </div>
        </div>
        
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3">
          <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-800 leading-relaxed">
            Group content is visible only to current members.
          </p>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="h-20 border-b border-gray-100 flex items-center justify-end px-8 shrink-0 gap-4">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            Save draft
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-sm flex items-center gap-2">
            Continue &rarr;
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 flex gap-12">
          {/* Selection Column */}
          <div className="flex-1 max-w-2xl">
            <p className="text-xs font-bold text-brand-600 tracking-widest uppercase mb-2">Step 2 of 3</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Select members</h1>
            <p className="text-sm text-gray-500 mb-8">Invite at least one person. You'll be assigned the OWNER role.</p>
            
            <div className="relative mb-6">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search people by name, email or @username" 
                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-brand-500 rounded-xl pl-10 pr-10 py-3.5 text-sm outline-none transition-all shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">⌘K</div>
            </div>
            
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <div className="flex gap-6">
                <button className="text-sm font-semibold text-gray-900 border-b-2 border-gray-900 pb-2 -mb-2.5">Suggested</button>
                <button className="text-sm font-medium text-gray-500 hover:text-gray-900 pb-2">Recent</button>
                <button className="text-sm font-medium text-gray-500 hover:text-gray-900 pb-2">All people</button>
              </div>
              <span className="text-xs font-medium text-brand-600">4 selected</span>
            </div>
            
            <div className="space-y-2 mb-6">
              {/* Selected User 1 */}
              <div className="bg-brand-50/50 border border-brand-200 rounded-xl p-3 flex items-center justify-between shadow-sm cursor-pointer hover:bg-brand-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded border border-brand-500 bg-brand-500 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">MC</div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Maya Chen</h4>
                    <p className="text-xs text-gray-500">Design systems • @mayac</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-600 tracking-wider">MEMBER</span>
              </div>
              
              {/* Selected User 2 */}
              <div className="bg-brand-50/50 border border-brand-200 rounded-xl p-3 flex items-center justify-between shadow-sm cursor-pointer hover:bg-brand-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded border border-brand-500 bg-brand-500 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">JL</div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Jamie Lee</h4>
                    <p className="text-xs text-gray-500">Research • @jamielee</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-600 tracking-wider">MEMBER</span>
              </div>

              {/* Selected User 3 */}
              <div className="bg-brand-50/50 border border-brand-200 rounded-xl p-3 flex items-center justify-between shadow-sm cursor-pointer hover:bg-brand-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded border border-brand-500 bg-brand-500 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">NK</div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Nina Kapoor</h4>
                    <p className="text-xs text-gray-500">Product design • @ninak</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-600 tracking-wider">MEMBER</span>
              </div>
              
              {/* Selected User 4 */}
              <div className="bg-brand-50/50 border border-brand-200 rounded-xl p-3 flex items-center justify-between shadow-sm cursor-pointer hover:bg-brand-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded border border-brand-500 bg-brand-500 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">TB</div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Theo Bennett</h4>
                    <p className="text-xs text-gray-500">Engineering • @theob</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-600 tracking-wider">MEMBER</span>
              </div>
              
              {/* Unselected User 1 */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm cursor-pointer hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center"></div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">MA</div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Marco Alvarez</h4>
                    <p className="text-xs text-gray-500">Engineering • @marcoa</p>
                  </div>
                </div>
              </div>
              
              {/* Unselected User 2 */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm cursor-pointer hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center"></div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">SM</div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Sofia Martins</h4>
                    <p className="text-xs text-gray-500">Operations • @sofiam</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Showing 6 of 248 people</span>
              <div className="flex gap-2">
                <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Summary Panel */}
          <div className="w-80 bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col h-fit">
            <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-gray-200">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-500 mb-4 shadow-sm border border-purple-200/50">
                <Users className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Launch crew</h2>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded tracking-widest uppercase mb-4">Private Group</span>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">Coordination for the October product release.</p>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Selected · 5</h3>
              <button className="text-xs font-medium text-brand-600 hover:text-brand-700">Clear</button>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-[10px]">AS</div>
                  <span className="text-sm font-medium text-gray-900">Alex Rivera</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded tracking-wider">OWNER</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">MC</div>
                  <span className="text-sm text-gray-600">Maya Chen</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">MEMBER</span>
                  <X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-red-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[10px]">JL</div>
                  <span className="text-sm text-gray-600">Jamie Lee</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">MEMBER</span>
                  <X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-red-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[10px]">NK</div>
                  <span className="text-sm text-gray-600">Nina Kapoor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">MEMBER</span>
                  <X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-red-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">TB</div>
                  <span className="text-sm text-gray-600">Theo Bennett</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">MEMBER</span>
                  <X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-red-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-xl p-4 mb-6">
              <h4 className="text-xs font-semibold text-gray-900 mb-1">Group roles</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                OWNER controls the group and roles. ADMIN manages members. MEMBER participates in the conversation.
              </p>
            </div>
            
            <button className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors shadow-sm mb-3">
              Continue to review &rarr;
            </button>
            <button className="w-full py-2 bg-transparent text-gray-500 hover:text-gray-900 font-medium transition-colors text-sm">
              Back to group details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
