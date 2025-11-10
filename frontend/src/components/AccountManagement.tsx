import { useState, useEffect } from 'react';
import { MdAdd, MdDelete, MdToggleOn, MdToggleOff, MdEmail, MdWarning, MdClose, MdCheck } from 'react-icons/md';
import type { Account, CreateAccountData } from '../api/accountApi';
import { fetchAccounts, createAccount, deleteAccount, toggleAccountStatus } from '../api/accountApi';

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<CreateAccountData>({
    email: '',
    password: '',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    name: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createAccount(formData);
      setShowAddForm(false);
      setFormData({
        email: '',
        password: '',
        imapHost: 'imap.gmail.com',
        imapPort: 993,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        name: '',
      });
      await loadAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete account: ${email}?`)) {
      return;
    }

    try {
      await deleteAccount(id);
      await loadAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleAccountStatus(id);
      await loadAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle account status');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Email Accounts</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your connected accounts</p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <MdAdd className="text-lg" />
            Add Account
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4 rounded flex items-center gap-3">
          <MdWarning className="text-red-500 text-xl flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <MdClose />
          </button>
        </div>
      )}

      {/* Add Account Form */}
      {showAddForm && (
        <div className="mx-6 mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Email Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="your.email@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="My Work Email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password/App Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="••••••••••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IMAP Host *
                </label>
                <input
                  type="text"
                  required
                  value={formData.imapHost}
                  onChange={(e) => setFormData({ ...formData, imapHost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="imap.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IMAP Port *
                </label>
                <input
                  type="number"
                  required
                  value={formData.imapPort}
                  onChange={(e) => setFormData({ ...formData, imapPort: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="993"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={formData.smtpHost}
                  onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="587"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <MdCheck />
                Add Account
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <MdClose />
                Cancel
              </button>
            </div>

            <div className="mt-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <p className="text-xs text-cyan-800">
                <strong>Note:</strong> For Gmail, you need to use an App Password. 
                Go to Google Account → Security → 2-Step Verification → App passwords to create one.
              </p>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading && accounts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading accounts...</p>
            </div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <MdEmail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new email account.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 gap-2"
              >
                <MdAdd className="text-lg" />
                Add Account
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div
                key={account._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{account.name || account.email}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          account.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {account.name && (
                      <p className="text-sm text-gray-600 mt-1">{account.email}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MdEmail className="text-base" />
                    <span className="font-medium">IMAP:</span> {account.imapHost}:{account.imapPort}
                  </div>
                  {account.smtpHost && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MdEmail className="text-base" />
                      <span className="font-medium">SMTP:</span> {account.smtpHost}:{account.smtpPort}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 pt-2">
                    Added: {new Date(account.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(account._id)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      account.isActive
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {account.isActive ? <MdToggleOff className="text-lg" /> : <MdToggleOn className="text-lg" />}
                    {account.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(account._id, account.email)}
                    className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <MdDelete />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
