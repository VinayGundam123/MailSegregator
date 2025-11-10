import { useState, useEffect, useCallback } from 'react';
import { MdSearch, MdWarning, MdRefresh } from 'react-icons/md';
import type { Email, EmailFilters } from '../api/emailApi';
import { fetchEmails } from '../api/emailApi';
import EmailList from './EmailList';
import EmailDetails from './EmailDetails';

export default function Onebox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  const loadEmails = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const filters: EmailFilters = {};
      
      if (searchQuery) filters.q = searchQuery;
      if (selectedFolder !== 'all') filters.folder = selectedFolder;
      if (selectedAccount !== 'all') filters.accountId = selectedAccount;
      
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
  }, [searchQuery, selectedFolder, selectedAccount, selectedEmail]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmails();
    }, 500);

    return () => clearTimeout(timer);
  }, [loadEmails]);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
  };

  const folders = ['all', 'INBOX', 'Sent', 'Drafts', 'Trash'];
  
  // Extract unique account IDs from emails
  const accounts = ['all', ...Array.from(new Set(emails.map(e => e.accountId)))];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {emails.length} {emails.length === 1 ? 'email' : 'emails'}
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search subject, sender, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Folder Filter */}
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder === 'all' ? 'All Folders' : folder}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {accounts.map((account) => (
              <option key={account} value={account}>
                {account === 'all' ? 'All Accounts' : account}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => loadEmails()}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
          >
            <MdRefresh className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MdWarning className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Inbox</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            {isLoading && emails.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
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

        <div className="flex-1 overflow-hidden">
          <EmailDetails email={selectedEmail} />
        </div>
      </div>
    </div>
  );
}
