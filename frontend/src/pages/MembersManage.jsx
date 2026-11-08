import React, { useState, useEffect } from 'react';
import { Search, Trash2, Shield, UserCheck } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const roleLabels = {
  admin: 'Admin',
  editor: 'Editor',
  author: 'Writer',
  reader: 'Reader',
};

const roleBadgeStyles = {
  admin: 'bg-purple-50 text-purple-800 border-purple-200',
  editor: 'bg-blue-50 text-blue-800 border-blue-200',
  author: 'bg-forest-tint text-forest border-forest-light',
  reader: 'bg-stone-100 text-stone-700 border-stone-200',
};

export const MembersManage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: 100,
      };
      if (roleFilter) params.role = roleFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get('/users', { params });
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      setError('Unable to load member directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const { data } = await api.put(`/users/${userId}/role`, { role: newRole });
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update member role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member account? This action cannot be undone.')) {
      return;
    }

    try {
      const { data } = await api.delete(`/users/${userId}`);
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Member Directory</h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Manage member accounts, permissions, and editorial access levels.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-borderWarm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
          />
          <Search className="w-3.5 h-3.5 text-ink-light absolute left-2.5 top-1/2 -translate-y-1/2" />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-stone-50 border border-borderWarm rounded text-xs text-ink focus:outline-none focus:border-forest"
        >
          <option value="">All roles</option>
          <option value="admin">Admins</option>
          <option value="editor">Editors</option>
          <option value="author">Writers</option>
          <option value="reader">Readers</option>
        </select>
      </div>

      {/* Members table */}
      {loading ? (
        <LoadingSpinner text="Loading member directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No members found"
          description="No accounts match your search or filter."
        />
      ) : (
        <div className="bg-white rounded-lg border border-borderWarm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-borderWarm text-ink-muted uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderWarm/60">
                {users.map((member) => {
                  const isSelf = member._id === currentUser?._id;
                  return (
                    <tr key={member._id} className="hover:bg-stone-50/50 transition">
                      <td className="py-3 px-4 font-medium text-ink flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-forest-tint text-forest flex items-center justify-center font-semibold text-xs">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span>
                          {member.name} {isSelf && '(You)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ink-muted">{member.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member._id, e.target.value)}
                          disabled={updatingId === member._id || isSelf}
                          className={`text-xs px-2 py-1 rounded border font-medium cursor-pointer focus:outline-none focus:border-forest ${
                            roleBadgeStyles[member.role] || roleBadgeStyles.reader
                          }`}
                        >
                          <option value="reader">Reader</option>
                          <option value="author">Writer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-ink-light">
                        {new Date(member.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => handleDelete(member._id)}
                            className="p-1 text-ink-muted hover:text-red-600 rounded transition"
                            title="Delete member account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersManage;
