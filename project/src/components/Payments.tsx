import React, { useState, useEffect } from 'react';
import { ChevronLeft, CreditCard, Calendar, Filter, ArrowUpRight, ArrowDownLeft, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'ai-task';
  amount: number;
  recipient: string;
  date: string;
  purpose: string;
}

const Payments: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(1000); // Example initial balance
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState({ recipient: '', amount: 0, purpose: '' });
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received' | 'ai-task'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Simulated API call to fetch transactions
    const fetchTransactions = async () => {
      // In a real application, this would be an API call
      const mockTransactions: Transaction[] = [
        { id: '1', type: 'sent', amount: 50, recipient: 'Alice', date: '2023-04-15', purpose: 'Collaboration on video project' },
        { id: '2', type: 'received', amount: 100, recipient: 'Bob', date: '2023-04-14', purpose: 'Writing services' },
        { id: '3', type: 'ai-task', amount: 25, recipient: 'AI System', date: '2023-04-13', purpose: 'Content generation' },
        { id: '4', type: 'sent', amount: 75, recipient: 'Charlie', date: '2023-04-12', purpose: 'Logo design' },
        { id: '5', type: 'received', amount: 150, recipient: 'Diana', date: '2023-04-11', purpose: 'Marketing consultation' },
      ];
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

    setFilteredTransactions(filtered);
  }, [transactions, filterType, searchTerm, sortBy, sortOrder]);

  const handleNewPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayment.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (newPayment.amount > balance) {
      setError('Insufficient balance');
      return;
    }
    // In a real application, this would be an API call
    const newTransaction: Transaction = {
      id: (transactions.length + 1).toString(),
      type: 'sent',
      amount: newPayment.amount,
      recipient: newPayment.recipient,
      date: new Date().toISOString().split('T')[0],
      purpose: newPayment.purpose,
    };
    setTransactions([...transactions, newTransaction]);
    setBalance(balance - newPayment.amount);
    setNewPayment({ recipient: '', amount: 0, purpose: '' });
    setShowNewPaymentForm(false);
    setSuccessMessage('Payment sent successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const totalSpent = transactions.reduce((sum, t) => sum + (t.type === 'sent' || t.type === 'ai-task' ? t.amount : 0), 0);

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4 text-navy-blue">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-navy-blue">Payments</h1>
        </div>

        <div className="bg-white text-navy-blue rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Summary</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg">Current Balance</p>
              <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-lg">Total Spent</p>
              <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => setShowNewPaymentForm(true)}
            className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center"
          >
            <Plus size={20} className="mr-2" />
            New Payment
          </button>
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="border rounded-full px-3 py-1"
            >
              <option value="all">All Transactions</option>
              <option value="sent">Sent</option>
              <option value="received">Received</option>
              <option value="ai-task">AI Tasks</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="border rounded-full px-3 py-1"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-gray-200 p-2 rounded-full"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-full py-2 px-4 pl-10"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {showNewPaymentForm && (
          <div className="bg-white rounded-lg p-6 shadow-md mb-8">
            <h3 className="text-xl font-bold mb-4">New Payment</h3>
            <form onSubmit={handleNewPayment}>
              <div className="mb-4">
                <label htmlFor="recipient" className="block mb-2">Recipient</label>
                <input
                  type="text"
                  id="recipient"
                  value={newPayment.recipient}
                  onChange={(e) => setNewPayment({...newPayment, recipient: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="amount" className="block mb-2">Amount</label>
                <input
                  type="number"
                  id="amount"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: parseFloat(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="purpose" className="block mb-2">Purpose</label>
                <input
                  type="text"
                  id="purpose"
                  value={newPayment.purpose}
                  onChange={(e) => setNewPayment({...newPayment, purpose: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewPaymentForm(false)}
                  className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-navy-blue text-white px-4 py-2 rounded-full hover:bg-opacity-90"
                >
                  Send Payment
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-white text-navy-blue rounded-lg p-6 shadow-md flex justify-between items-center">
              <div className="flex items-center">
                {transaction.type === 'sent' && <ArrowUpRight size={24} className="text-red-500 mr-4" />}
                {transaction.type === 'received' && <ArrowDownLeft size={24} className="text-green-500 mr-4" />}
                {transaction.type === 'ai-task' && <CreditCard size={24} className="text-blue-500 mr-4" />}
                <div>
                  <p className="text-xl font-bold">{transaction.recipient}</p>
                  <p className="text-gray-600">{transaction.purpose}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${transaction.type === 'received' ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.type === 'received' ? '+' : '-'}${transaction.amount}
                </p>
                <p className="text-gray-600 flex items-center justify-end">
                  <Calendar size={16} className="mr-2" />
                  {transaction.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Payments;