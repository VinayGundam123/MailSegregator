import { useState } from 'react';
import { MdEmail, MdSmartToy, MdContentCopy, MdCheck } from 'react-icons/md';
import type { Email } from '../api/emailApi';
import { suggestReply } from '../api/replyApi';

interface EmailDetailsProps {
  email: Email | null;
}


export default function EmailDetails({ email }: EmailDetailsProps) {
  const [suggestedReply, setSuggestedReply] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!email) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center text-gray-400">
          <MdEmail className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-sm">Select an email to view details</p>
        </div>
      </div>
    );
  }

  const handleSuggestReply = async () => {
    if (!email.text) return;
    
    setIsLoading(true);
    try {
      const reply = await suggestReply(email.text);
      setSuggestedReply(reply);
    } catch (error) {
      console.error('Failed to get reply suggestion:', error);
      setSuggestedReply('Failed to generate reply. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(suggestedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-900 flex-1 pr-4">
            {email.subject || '(No Subject)'}
          </h2>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className="text-gray-500 w-16">From:</span>
            <span className="text-gray-900 font-medium">{email.from || 'Unknown'}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 w-16">To:</span>
            <span className="text-gray-900">{email.to || 'Unknown'}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 w-16">Date:</span>
            <span className="text-gray-600">{formatDate(email.date)}</span>
          </div>
          {email.label && (
            <div className="flex items-center">
              <span className="text-gray-500 w-16">Label:</span>
              <span className="text-gray-900 font-medium">{email.label}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {email.text || 'No content available'}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 p-6 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MdSmartToy className="text-lg" />
            AI Suggested Reply
          </h3>
          {!suggestedReply && (
            <button
              onClick={handleSuggestReply}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Suggest Reply'}
            </button>
          )}
        </div>

        {suggestedReply && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
              {suggestedReply}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCopyReply}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                {copied ? <><MdCheck /> Copied!</> : <><MdContentCopy /> Copy Reply</>}
              </button>
              <button
                onClick={() => setSuggestedReply('')}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
