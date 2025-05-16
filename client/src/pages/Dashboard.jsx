// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  ArrowUp,
  ArrowDown,
  Copy ,
  Edit2 ,
  Trash2 ,
} from 'lucide-react';
import '../components/Dashboard.css'

export default function Dashboard() {
  const location = useLocation();
  const history = useHistory();
  //const navigate = useNavigate();
  const { accessToken, logout } = useAuth();

  const params = new URLSearchParams(location.search);
  const initialSearch = params.get('search') || '';
  const initialSortKey = params.get('sortKey') || null;
  const initialSortDir = params.get('sortDir') || null;
  const initialPage = parseInt(params.get('page'), 10) || 1;

  const [creds, setCreds] = useState([]);
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [displayedCreds, setDisplayedCreds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: initialSortKey, direction: initialSortDir });
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ website: '', username: '', password: '' });

  const itemsPerPage = 10;

  // Fetch
  useEffect(() => {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    fetchCredentials();
  }, [accessToken]);

  const fetchCredentials = async () => {
    try {
      const res = await api.get('/credentials');
      setCreds(res.data);
    } catch {
      alert('Failed to fetch credentials', { autoClose: 2000 });
    }
  };

  // Sync URL
  useEffect(() => {
    const q = new URLSearchParams();
    if (searchTerm) q.set('search', searchTerm);
    if (sortConfig.key) {
      q.set('sortKey', sortConfig.key);
      q.set('sortDir', sortConfig.direction);
    }
    if (currentPage > 1) q.set('page', currentPage);
    history.replace({ search: q.toString() });
  }, [searchTerm, sortConfig, currentPage, history]);

  // Debounce
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };
  const onSearchChange = debounce(val => { setSearchTerm(val); setCurrentPage(1); }, 300);

  // Sort
  const requestSort = key => {
    let dir = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') dir = 'desc';
    setSortConfig({ key, direction: dir });
  };

  // Filter & sort
  const applyFilters = useCallback(() => {
    let filtered = creds.filter(c =>
      c.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortConfig.key) {
      filtered.sort((a, b) =>
        a[sortConfig.key].localeCompare(b[sortConfig.key]) * (sortConfig.direction === 'asc' ? 1 : -1)
      );
    }
    setDisplayedCreds(filtered);
  }, [creds, searchTerm, sortConfig]);
  useEffect(() => applyFilters(), [creds, searchTerm, sortConfig, applyFilters]);

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = displayedCreds.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(displayedCreds.length / itemsPerPage,1);
  const handlePageChange = dir => setCurrentPage(p => Math.min(Math.max(p + dir, 1), totalPages));

  // Add
  const handleAdd = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/credentials', { website, username, password });
      setCreds(prev => [{ id: res.data.id, website, username, password }, ...prev]);
      setWebsite(''); setUsername(''); setPassword('');
      alert('Added', { autoClose: 2000 });
    } catch {
      alert('Add failed', { autoClose: 2000 });
    }
  };

  // Edit
  const startEdit = c => {
    setEditingId(c.id);
    setEditForm({ website: c.website, username: c.username, password: c.password });
  };
  const cancelEdit = () => setEditingId(null);
  const handleUpdate = async id => {
    try {
      await api.put(`/credentials/${id}`, editForm);
      setCreds(prev => prev.map(c => c.id === id ? { id, ...editForm } : c));
      setEditingId(null);
      alert('Updated Successfully', { autoClose: 2000 });
    } catch {
      alert('Update failed', { autoClose: 2000 });
    }
  };

  // Copy/Delete
 const copyToClipboard = txt => {
    navigator.clipboard.writeText(txt);
    alert('Copied to clipboard', { autoClose: 2000 });
  };
  const handleDelete = async id => {
    if (!window.confirm('Confirm delete?')) return;
    try {
      await api.delete(`/credentials/${id}`);
      setCreds(prev => prev.filter(c => c.id !== id));
      alert('Deleted Successfully', { autoClose: 2000 });
    } catch {
      alert('Delete failed', { autoClose: 2000 });
    }
  };

    return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>Your Credentials</h1>
          <button
            onClick={() => {
              logout();
              history.push('/login');
              window.location.reload();
            }}
            className="logout-btn"
          >
            Logout
          </button>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="add-form">
          <input
            type="url"
            placeholder="Website URL"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="add-btn">
              Add
            </button>
          </div>
        </form>

        {/* Search */}
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search..."
            defaultValue={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="credentials-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('website')}>
                  Website{' '}
                  {sortConfig.key === 'website' &&
                    (sortConfig.direction === 'asc' ? (
                      <ArrowUp size={16} />
                    ) : (
                      <ArrowDown size={16} />
                    ))}
                </th>
                <th onClick={() => requestSort('username')}>
                  Username{' '}
                  {sortConfig.key === 'username' &&
                    (sortConfig.direction === 'asc' ? (
                      <ArrowUp size={16} />
                    ) : (
                      <ArrowDown size={16} />
                    ))}
                </th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(c => (
                <tr key={c.id}>
                  {editingId === c.id ? (
                    <>
                      <td>
                        <input
                          value={editForm.website}
                          onChange={e =>
                            setEditForm(prev => ({
                              ...prev,
                              website: e.target.value,
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={editForm.username}
                          onChange={e =>
                            setEditForm(prev => ({
                              ...prev,
                              username: e.target.value,
                            }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={editForm.password}
                          onChange={e =>
                            setEditForm(prev => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                        />
                      </td>
                      <td>
                        <button onClick={() => handleUpdate(c.id)} className='save-btn'>
                          Save
                        </button>
                        <button onClick={cancelEdit} className='cancel-btn'>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{c.website}</td>
                      <td>
                        {c.username}
                        <button
                          className="action-btn"
                          onClick={() => copyToClipboard(c.username)}
                        >
                          <Copy size={16} />
                        </button>
                      </td>
                      <td>{'•'.repeat(c.password.length)}</td>
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => copyToClipboard(c.password)}
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => startEdit(c)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => handlePageChange(-1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}