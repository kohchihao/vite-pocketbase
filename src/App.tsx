import dayjs from 'dayjs';
import PocketBase from 'pocketbase';
import { useEffect, useState } from 'react';
import './App.css';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

const pb = new PocketBase('http://127.0.0.1:8090');

function App() {
  const [count, setCount] = useState(0);

  async function getCurrentMonthTransactions() {
    const startOfMonth = dayjs().startOf('month').toISOString();
    const endOfMonth = dayjs().endOf('month').toISOString();

    const transactions = await pb.collection('transactions').getFullList({
      filter: `date >= "${startOfMonth}" && date <= "${endOfMonth}"`,
    });

    console.log(
      '[current month txn]',
      transactions,
      'query',
      startOfMonth,
      endOfMonth
    );
  }

  async function getAllTransactions() {
    const transactions = await pb.collection('transactions').getFullList();
    console.log('[all txn]', transactions);
  }

  async function getExpenseBreakdown() {
    const startOfMonth = dayjs().startOf('month').toISOString();
    const endOfMonth = dayjs().endOf('month').toISOString();

    // Fetch all transactions for the current month
    const transactions = await pb.collection('transactions').getFullList({
      filter: `date >= "${startOfMonth}" && date <= "${endOfMonth}"`,
    });

    // Group transactions by category_id and sum amounts
    const breakdown = transactions.reduce((acc, txn) => {
      const { category_id, amount } = txn;

      if (!acc[category_id]) {
        acc[category_id] = { total: 0 };
      }

      acc[category_id].total += amount;
      return acc;
    }, {});

    // Calculate the grand total
    const grandTotal = Object.values(breakdown).reduce(
      (sum, { total }) => sum + total,
      0
    );

    // Calculate percentage for each category
    const breakdownWithPercentage = Object.entries(breakdown).map(
      ([category_id, data]) => ({
        category_id: Number(category_id),
        total: data.total,
        percentage:
          grandTotal > 0
            ? ((data.total / grandTotal) * 100).toFixed(2)
            : '0.00',
      })
    );

    console.log('[expense breakdown]', breakdownWithPercentage);
  }

  async function searchTransactions(query) {
    const transactions = await pb.collection('transactions').getFullList({
      filter: `description ~ "${query}"`,
    });
    console.log('[search txn]', transactions);
  }

  useEffect(() => {
    // getAllTransactions();
    // getCurrentMonthTransactions();
    getExpenseBreakdown();
    searchTransactions('test');
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
