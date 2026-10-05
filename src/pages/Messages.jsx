import { Search, Edit, Phone, Video, Info, Paperclip, Image as ImageIcon, Smile, AtSign, Send, MoreHorizontal, Download, BellOff, UserPlus, FileText, Link as LinkIcon, X } from 'lucide-react'

export default function Messages() {
  return (
    <div className="flex-1 flex h-full">
      {/* Messages Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-emerald-500 font-medium">8 people online</span>
              </div>
            </div>
            <button className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations" 
              className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-brand-500 rounded-lg pl-9 pr-3 py-2 text-sm outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">⌘K</div>
          </div>
          
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-medium">All 12</button>
            <button className="px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-full text-xs font-medium border border-gray-200">Unread 7</button>
            <button className="px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-full text-xs font-medium border border-gray-200">Groups</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-400 mb-3 tracking-wider uppercase">Pinned</h3>
            <div className="bg-brand-50 rounded-xl p-3 flex gap-3 cursor-pointer border border-brand-100">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">PR</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-semibold text-gray-900 truncate">Product room</h4>
                  <span className="text-xs text-brand-600 font-medium">10:45</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600 truncate font-medium">Maya: Updated the launch checklist</p>
                  <div className="w-4 h-4 bg-brand-500 rounded-full text-white flex items-center justify-center text-[10px] font-bold">3</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 flex gap-3 cursor-pointer hover:bg-gray-50 rounded-xl mt-1">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0 relative">
                MC
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-semibold text-gray-900 truncate">Maya Chen</h4>
                  <span className="text-xs text-gray-400">10:44</span>
                </div>
                <p className="text-xs text-brand-500 font-medium truncate">Typing...</p>
              </div>
            </div>
            
            <h3 className="text-xs font-semibold text-gray-400 mb-3 mt-6 tracking-wider uppercase">Recent</h3>
            {/* Recent Item 1 */}
            <div className="p-3 flex gap-3 cursor-pointer hover:bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">JL</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-semibold text-gray-900 truncate">Jamie Lee</h4>
                  <span className="text-xs text-brand-600 font-medium">9:28</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 truncate">Shared: research-notes.pdf</p>
                  <div className="w-4 h-4 bg-brand-500 rounded-full text-white flex items-center justify-center text-[10px] font-bold">1</div>
                </div>
              </div>
            </div>
            
            {/* Recent Item 2 */}
            <div className="p-3 flex gap-3 cursor-pointer hover:bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">DE</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-semibold text-gray-900 truncate">Design critique</h4>
                  <span className="text-xs text-brand-600 font-medium">Yesterday</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 truncate font-medium">Nina: Love the quieter hierarchy</p>
                  <div className="w-4 h-4 bg-brand-500 rounded-full text-white flex items-center justify-center text-[10px] font-bold">3</div>
                </div>
              </div>
            </div>
            
            {/* Recent Item 3 */}
            <div className="p-3 flex gap-3 cursor-pointer hover:bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">NK</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-semibold text-gray-900 truncate">Nina Kapoor</h4>
                  <span className="text-xs text-gray-400">Yesterday</span>
                </div>
                <p className="text-xs text-gray-500 truncate">You: Let's sync tomorrow</p>
              </div>
            </div>
            
            {/* Recent Item 4 */}
            <div className="p-3 flex gap-3 cursor-pointer hover:bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">OP</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-semibold text-gray-900 truncate">Operations</h4>
                  <span className="text-xs text-gray-400">Mon</span>
                </div>
                <p className="text-xs text-gray-500 truncate">Incident resolved - all systems normal</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors">
            <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
              <div className="w-2 h-0.5 bg-gray-300"></div>
            </div>
            Archived conversations <span className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">4</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/50">
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">PR</div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="font-semibold text-gray-900">Product room</h2>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded tracking-wide">GROUP</span>
              </div>
              <p className="text-xs text-gray-500">12 members • 6 online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <button className="p-2 text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          <div className="flex justify-center mb-8">
            <button className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-4 py-1.5 rounded-full hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
              <span className="text-lg leading-none">&uarr;</span> Load earlier messages
            </button>
          </div>
          
          <div className="flex justify-center mb-6">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest bg-gray-50/50 px-2 relative z-10">
              Today • Oct 5
            </span>
            <div className="h-px bg-gray-200 absolute left-6 right-[350px] mt-2 z-0"></div>
          </div>
          
          <div className="flex flex-col gap-6">
            {/* Message 1 */}
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">MC</div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Maya Chen</span>
                  <span className="text-xs text-gray-400">10:32</span>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed max-w-2xl">
                  Morning! The launch checklist is updated. I moved the accessibility review ahead of final QA so we have room for fixes.
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <button className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2 py-1 text-xs hover:bg-gray-50">
                    👍 <span className="font-medium text-gray-600">4</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2 py-1 text-xs hover:bg-gray-50">
                    🎉 <span className="font-medium text-gray-600">2</span>
                  </button>
                  <button className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Smile className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded"><Smile className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Message 2 */}
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">AR</div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Alex Rivera</span>
                  <span className="text-xs text-gray-400">10:36</span>
                </div>
                <div className="bg-gray-50 border-l-2 border-brand-500 p-3 rounded-r-xl rounded-bl-xl mb-2 max-w-2xl">
                  <p className="text-xs text-brand-600 font-medium mb-1">Alex Rivera</p>
                  <p className="text-sm text-gray-500">The launch checklist is updated.</p>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed max-w-2xl">
                  Perfect. I've assigned Jamie to the review and added notes for keyboard navigation.
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 font-medium">
                  <span className="text-brand-500">✓✓</span> Read by 8
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded"><Smile className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Message 3 */}
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">JL</div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Jamie Lee</span>
                  <span className="text-xs text-gray-400">10:41</span>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed max-w-2xl mb-2">
                  Sharing the notes from today's test.
                </div>
                <div className="flex items-center gap-4 bg-white border border-gray-200 p-3 rounded-xl max-w-md shadow-sm">
                  <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">accessibility-review.pdf</p>
                    <p className="text-xs text-gray-500">2.4 MB • PDF</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* New messages separator */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-brand-200"></div>
              <span className="text-[10px] font-bold text-brand-500 tracking-wider">1 NEW</span>
              <div className="flex-1 h-px bg-brand-200"></div>
            </div>

            {/* Message 4 */}
            <div className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0 relative">
                NK
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Nina Kapoor</span>
                  <span className="text-xs text-brand-600 font-medium">10:45</span>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed max-w-2xl">
                  I'm online for the next hour if anyone wants to pair on the final states.
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <button className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2 py-1 text-xs hover:bg-gray-50 border-emerald-200 bg-emerald-50 text-emerald-700">
                    ✅ <span className="font-medium text-emerald-700">3</span>
                  </button>
                  <button className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-opacity">
                    <Smile className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded"><Smile className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">MC</div>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0ms'}}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '150ms'}}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '300ms'}}></span>
            </div>
            <span className="text-xs text-gray-500 italic ml-1">Maya is typing...</span>
          </div>
        </div>
        
        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="border border-gray-200 rounded-2xl p-2 shadow-sm focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all bg-white">
            <input 
              type="text" 
              placeholder="Message Product room" 
              className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder-gray-400"
            />
            <div className="flex items-center justify-between mt-2 px-1 pb-1">
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <AtSign className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 font-medium">⌘ + Enter to send</span>
                <button className="w-8 h-8 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center justify-center transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Details Pane */}
      <div className="w-80 flex-shrink-0 border-l border-gray-100 bg-white flex flex-col">
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <h3 className="font-semibold text-gray-900">Details</h3>
          <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-2xl mb-4">PR</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Product room</h2>
            <p className="text-sm text-gray-500 leading-relaxed">Planning, decisions and launch coordination.</p>
          </div>
          
          <div className="flex gap-3 mb-8">
            <button className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex flex-col items-center gap-1 transition-colors">
              <BellOff className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">Mute</span>
            </button>
            <button className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex flex-col items-center gap-1 transition-colors">
              <UserPlus className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">Invite</span>
            </button>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Members <span className="text-gray-400 font-normal">· 12</span></h3>
              <button className="text-xs font-medium text-brand-600 hover:text-brand-700">View all</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs relative">
                  MC
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Maya Chen</p>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider">OWNER</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs relative">
                  AR
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Alex Rivera</p>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider">ADMIN</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs relative">
                  JL
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Jamie Lee</p>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider">MEMBER</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">NK</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Nina Kapoor</p>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider">MEMBER</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Shared content</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Media</span>
                </div>
                <span className="text-xs font-bold text-gray-900">36</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Files</span>
                </div>
                <span className="text-xs font-bold text-gray-900">14</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Links</span>
                </div>
                <span className="text-xs font-bold text-gray-900">9</span>
              </button>
            </div>
          </div>
          
          <button className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors">
            Leave group
          </button>
        </div>
      </div>
    </div>
  )
}
