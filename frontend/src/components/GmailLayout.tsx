import { useState, useEffect, useCallback } from 'react';
import { MdInbox, MdSend, MdDrafts, MdDelete, MdReport, MdMenu, MdSearch, MdRefresh, MdAccountCircle } from 'react-icons/md';
import type { Email, EmailFilters } from '../api/emailApi';
import type { Account } from '../api/accountApi';
import { fetchEmails } from '../api/emailApi';
import { fetchAccounts } from '../api/accountApi';
import EmailList from './EmailList';
import EmailDetails from './EmailDetails';

const folders = [
  { name: 'INBOX', label: 'Inbox', icon: MdInbox },
  { name: '[Gmail]/Sent Mail', label: 'Sent', icon: MdSend },
  { name: '[Gmail]/Drafts', label: 'Drafts', icon: MdDrafts },
  { name: '[Gmail]/Spam', label: 'Spam', icon: MdReport },
  { name: '[Gmail]/Trash', label: 'Trash', icon: MdDelete },
];

export default function GmailLayout() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('INBOX');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  const loadEmails = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const filters: EmailFilters = {};
      
      if (searchQuery) filters.q = searchQuery;
      if (selectedFolder !== 'all') filters.folder = selectedFolder;
      if (selectedAccountId !== 'all') filters.accountId = selectedAccountId;
      
      const data = await fetchEmails(filters);
      setEmails(data);
      
      // Clear selection if email not in new results
      if (selectedEmail && !data.find(e => e.id === selectedEmail.id)) {
        setSelectedEmail(null);
      }
    } catch (err) {
      console.error('Failed to load emails:', err);
      setError('Failed to load emails. Make sure the backend is running on port 3000.');
      setEmails([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedFolder, selectedAccountId, selectedEmail]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmails();
    }, 500);

    return () => clearTimeout(timer);
  }, [loadEmails]);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
  };

  const currentAccount = accounts.find(acc => acc.email === selectedAccountId);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <MdMenu className="text-xl text-gray-600" />
        </button>

        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 rounded p-1.5">
            <MdInbox className="text-white text-xl" />
          </div>
          <h1 className="text-xl font-normal text-gray-700">ReachInbox</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search mail"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadEmails()}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title="Refresh"
          >
            <MdRefresh className={`text-xl text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Account Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <MdAccountCircle className="text-2xl text-gray-600" />
              {currentAccount && (
                <span className="text-sm text-gray-700 hidden md:block">
                  {currentAccount.email}
                </span>
              )}
            </button>

            {showAccountDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-xs text-gray-500 font-medium">Switch Account</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedAccountId('all');
                    setShowAccountDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                    selectedAccountId === 'all' ? 'bg-cyan-50 text-cyan-600' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MdAccountCircle className="text-xl" />
                    <span>All Accounts</span>
                  </div>
                </button>
                {accounts.map((account) => (
                  <button
                    key={account._id}
                    onClick={() => {
                      setSelectedAccountId(account.email);
                      setShowAccountDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                      selectedAccountId === account.email ? 'bg-cyan-50 text-cyan-600' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MdAccountCircle className="text-xl" />
                      <div className="flex-1">
                        <p className="font-medium">{account.name || account.email}</p>
                        {account.name && (
                          <p className="text-xs text-gray-500">{account.email}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mx-4 mt-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Folders */}
        <div
          className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ${
            sidebarCollapsed ? 'w-16' : 'w-56'
          }`}
        >

          <nav className="flex-1 px-2 space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isActive = selectedFolder === folder.name;
              const count = emails.filter(e => e.folder === folder.name).length;

              return (
                <button
                  key={folder.name}
                  onClick={() => setSelectedFolder(folder.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-xl flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{folder.label}</span>
                      {count > 0 && (
                        <span className="text-xs text-gray-500">{count}</span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Account Count */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
              </p>
            </div>
          )}
        </div>

        {/* Email List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-900">
              {folders.find(f => f.name === selectedFolder)?.label || 'Emails'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {emails.length} {emails.length === 1 ? 'message' : 'messages'}
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            {isLoading && emails.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-cyan-600"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading emails...</p>
                </div>
              </div>
            ) : (
              <EmailList
                emails={emails}
                selectedEmailId={selectedEmail?.id || null}
                onSelectEmail={handleSelectEmail}
              />
            )}
          </div>
        </div>

        {/* Email Details */}
        <div className="flex-1 overflow-hidden bg-white">
          <EmailDetails email={selectedEmail} />
        </div>
      </div>
    </div>
  );
}
