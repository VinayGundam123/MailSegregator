import { useState } from 'react'
import { MdSettings } from 'react-icons/md'
import GmailLayout from './components/GmailLayout'
import AccountManagement from './components/AccountManagement'

type ViewType = 'inbox' | 'accounts';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('inbox');

  if (activeView === 'accounts') {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveView('inbox')}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              ← Back to Inbox
            </button>
            <div className="flex items-center gap-2">
              <MdSettings className="text-xl text-gray-600" />
              <h1 className="text-lg font-medium text-gray-900">Account Settings</h1>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <AccountManagement />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <GmailLayout />
      <button
        onClick={() => setActiveView('accounts')}
        className="fixed bottom-6 right-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
        title="Account Settings"
      >
        <MdSettings className="text-2xl" />
      </button>
    </div>
  );
}

export default App
