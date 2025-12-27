import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import axios from 'axios';
import StatusIcon from '../components/StatusIcon';
import InfoCard from '../components/InfoCard';
import './Overview.css';

const Overview = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, statsRes] = await Promise.all([
        axios.get('/api/customers'),
        axios.get('/api/dashboard/stats'),
      ]);
      setCustomers(customersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: 'customer_id',
      header: 'מזהה לקוח',
      cell: (info) => (
        <span className="customer-id-link" onClick={() => navigate(`/customer/${info.getValue()}`)}>
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'שם',
    },
    {
      accessorKey: 'ai_summary',
      header: 'סיכום AI',
      cell: (info) => {
        const summary = info.getValue() || 'אין סיכום זמין';
        return (
          <span className="summary-cell" title={summary}>
            {summary.length > 100 ? `${summary.substring(0, 100)}...` : summary}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'סטטוס',
      cell: (info) => <StatusIcon status={info.getValue()} size="small" />,
    },
  ];

  const table = useReactTable({
    data: customers,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return <div className="loading">טוען לקוחות...</div>;
  }

  return (
    <div className="overview-page">
      <h1>סקירת לקוחות</h1>

      {/* Information Cards */}
      <div className="info-cards">
        <InfoCard
          title="פניות פתוחות"
          value={stats?.open_calls || 0}
          color="#e74c3c"
          icon="📞"
        />
        <InfoCard
          title="עדיפות נמוכה"
          value={stats?.low_customers || 0}
          color="#27ae60"
          icon="✓"
        />
        <InfoCard
          title="עדיפות רגילה"
          value={stats?.normal_customers || 0}
          color="#f39c12"
          icon="○"
        />
        <InfoCard
          title="עדיפות דחופה"
          value={stats?.urgent_customers || 0}
          color="#e74c3c"
          icon="!"
        />
      </div>

      {/* Customer Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>לקוחות</h2>
          <input
            type="text"
            placeholder="חיפוש לקוחות..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="search-input"
          />
        </div>
        <table className="customer-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getCanSort() ? 'sortable' : ''}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted()] ?? ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} onClick={() => navigate(`/customer/${row.original.customer_id}`)}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Overview;

