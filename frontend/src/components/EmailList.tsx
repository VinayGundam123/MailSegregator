import { MdEmail } from 'react-icons/md';
import type { Email } from '../api/emailApi';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (email: Email) => void;
}

const categoryColors: Record<string, string> = {
  'Interested': 'bg-green-100 text-green-700 border-green-300',
  'Meeting Booked': 'bg-cyan-100 text-cyan-700 border-cyan-300',
  'Not Interested': 'bg-red-100 text-red-700 border-red-300',
  'Follow-up': 'bg-orange-100 text-orange-700 border-orange-300',
  'Spam': 'bg-gray-100 text-gray-700 border-gray-300',
  'Out of Office': 'bg-purple-100 text-purple-700 border-purple-300',
  'Uncategorized': 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function EmailList({ emails, selectedEmailId, onSelectEmail }: EmailListProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <MdEmail className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm">No emails found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => onSelectEmail(email)}
          className={`p-4 border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${
            selectedEmailId === email.id ? 'bg-cyan-50 border-l-4 border-l-cyan-500' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {email.from || 'Unknown Sender'}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              {email.label && (
                <span className={`text-xs px-2 py-1 rounded-full border ${categoryColors[email.label] || categoryColors['Uncategorized']}`}>
                  {email.label}
                </span>
              )}
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDate(email.date)}
              </span>
            </div>
          </div>
          
          <p className="text-sm font-medium text-gray-800 mb-1 truncate">
            {email.subject || '(No Subject)'}
          </p>
          
          <p className="text-xs text-gray-600 line-clamp-2">
            {truncateText(email.text || '', 120)}
          </p>
        </div>
      ))}
    </div>
  );
}
