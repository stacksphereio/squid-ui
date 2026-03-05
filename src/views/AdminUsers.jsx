// src/views/AdminUsers.jsx
import React from "react";
import { listUsers, getUser, createUser, updateUser, updateUserRoles, resetUserPassword, listRoles, listCountries } from "../api/admin";
import { RightSheet } from "./AdminUserDetail";

function RoleBadge({ r }) {
  const stop = (e) => e.stopPropagation(); // not clickable, avoid bubbling
  return (
    <span className="badge role-badge" onClick={stop} onMouseDown={stop} title={r}>
      {r}
    </span>
  );
}

function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="modal-dialog" style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 202,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} className="btn" style={{ padding: '4px 12px' }}>✕</button>
        </div>
        {children}
      </div>
    </>
  );
}

function CreateUserModal({ show, onClose, onSuccess, availableRoles, availableCountries }) {
  const [formData, setFormData] = React.useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    country: '',
    roles: []
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return;
    }
    setSaving(true);
    try {
      await createUser(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  return (
    <Modal show={show} onClose={onClose} title="Create New User">
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="form-row">
          <label className="form-label">Username *</label>
          <input
            className="input"
            value={formData.username}
            onChange={e => setFormData({...formData, username: e.target.value})}
            required
          />
        </div>
        <div className="form-row">
          <label className="form-label">Password *</label>
          <input
            className="input"
            type="password"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <div className="form-row">
          <label className="form-label">Full Name</label>
          <input
            className="input"
            value={formData.full_name}
            onChange={e => setFormData({...formData, full_name: e.target.value})}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Email</label>
          <input
            className="input"
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Phone</label>
          <input
            className="input"
            value={formData.phone_number}
            onChange={e => setFormData({...formData, phone_number: e.target.value})}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Address</label>
          <input
            className="input"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Country</label>
          <select
            className="input"
            value={formData.country}
            onChange={e => setFormData({...formData, country: e.target.value})}
          >
            <option value="">
              {availableCountries.length === 0 ? 'Loading countries...' : 'Select a country...'}
            </option>
            {availableCountries.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label className="form-label">Roles</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {availableRoles.map(role => (
              <label key={role} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                {role}
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button type="submit" className="btn primary fullwidth" disabled={saving}>
            {saving ? 'Creating...' : 'Create User'}
          </button>
          <button type="button" className="btn fullwidth" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditUserModal({ show, onClose, onSuccess, user, availableCountries }) {
  const [formData, setFormData] = React.useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    country: ''
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        country: user.country || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateUser(user.user_id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Edit User Profile">
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="form-row">
          <label className="form-label">Full Name</label>
          <input
            className="input"
            value={formData.full_name}
            onChange={e => setFormData({...formData, full_name: e.target.value})}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Email</label>
          <input
            className="input"
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Phone</label>
          <input
            className="input"
            value={formData.phone_number}
            onChange={e => setFormData({...formData, phone_number: e.target.value})}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Address</label>
          <input
            className="input"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Country</label>
          <select
            className="input"
            value={formData.country}
            onChange={e => setFormData({...formData, country: e.target.value})}
          >
            <option value="">
              {availableCountries.length === 0 ? 'Loading countries...' : 'Select a country...'}
            </option>
            {availableCountries.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button type="submit" className="btn primary fullwidth" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="btn fullwidth" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ManageRolesModal({ show, onClose, onSuccess, user, availableRoles }) {
  const [selectedRoles, setSelectedRoles] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles || []);
    }
  }, [user]);

  const toggleRole = (role) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateUserRoles(user.user_id, selectedRoles);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update roles');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Manage User Roles">
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        <p style={{ marginBottom: 16, color: '#666' }}>
          Select roles for {user?.username}:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {availableRoles.map(role => (
            <label key={role} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => toggleRole(role)}
              />
              <span style={{ fontWeight: 500 }}>{role}</span>
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button type="submit" className="btn primary fullwidth" disabled={saving}>
            {saving ? 'Saving...' : 'Save Roles'}
          </button>
          <button type="button" className="btn fullwidth" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPasswordModal({ show, onClose, onSuccess, user }) {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await resetUserPassword(user.user_id, password);
      onSuccess();
      onClose();
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="Reset Password">
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
        <p style={{ marginBottom: 16, color: '#666' }}>
          Reset password for {user?.username}:
        </p>
        <div className="form-row">
          <label className="form-label">New Password *</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <label className="form-label">Confirm Password *</label>
          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button type="submit" className="btn primary fullwidth" disabled={saving}>
            {saving ? 'Resetting...' : 'Reset Password'}
          </button>
          <button type="button" className="btn fullwidth" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminUsers() {
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);
  const [rows, setRows] = React.useState([]);
  const [availableRoles, setAvailableRoles] = React.useState([]);
  const [availableCountries, setAvailableCountries] = React.useState([]);

  // UI state
  const [q, setQ] = React.useState("");
  const [sortDir, setSortDir] = React.useState("asc");

  // Detail panel state
  const [selectedId, setSelectedId] = React.useState(null);
  const [detail, setDetail] = React.useState(null);
  const [detailError, setDetailError] = React.useState(null);
  const [detailLoading, setDetailLoading] = React.useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showRolesModal, setShowRolesModal] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);

  // Load roles and countries
  React.useEffect(() => {
    (async () => {
      try {
        const roles = await listRoles();
        console.log('[AdminUsers] Loaded roles:', roles.length);
        setAvailableRoles(roles.map(r => r.name));
      } catch (e) {
        console.error("Failed to load roles:", e);
      }
      try {
        const countries = await listCountries();
        console.log('[AdminUsers] Loaded countries:', countries.length, countries.slice(0, 3));
        setAvailableCountries(countries);
      } catch (e) {
        console.error("Failed to load countries:", e);
      }
    })();
  }, []);

  // Load list
  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await listUsers();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Load detail when selectedId changes
  React.useEffect(() => {
    let alive = true;
    if (!selectedId) return;
    (async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);
        const u = await getUser(selectedId);
        if (alive) setDetail(u || null);
      } catch (e) {
        if (alive) setDetailError(e.message || String(e));
      } finally {
        if (alive) setDetailLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedId]);

  if (loading) return <p>Loading users…</p>;
  if (err)     return <p className="error">Error: {err}</p>;

  // filter + sort
  const filtered = rows.filter(u => {
    const hay = `${u.username} ${u.full_name || ""} ${u.email || ""} ${(u.roles||[]).join(" ")}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });
  const sorted = [...filtered].sort((a,b) => {
    const cmp = (a.username || "").localeCompare(b.username || "", undefined, { sensitivity: "base" });
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>User Admin</h2>
        <div className="tools">
          <button
            className="btn primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Create User
          </button>
          <input
            className="input"
            placeholder="Search username, email, role…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button
            className="btn btn-ghost"
            onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
            aria-label={`Sort ${sortDir === "asc" ? "descending" : "ascending"}`}
          >
            Sort: {sortDir === "asc" ? "A→Z" : "Z→A"}
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p>No matching users.</p>
      ) : (
        <div className="table-wrap">
          <table className="table table-hover table-tight table-fixed admin-users">
            <colgroup>
              <col style={{ width: '18%' }} />  {/* User name */}
              <col style={{ width: '22%' }} />  {/* Full name */}
              <col style={{ width: '28%' }} />  {/* Email */}
              <col style={{ width: '10%' }} />  {/* Country */}
              <col />                           {/* Roles (flex) */}
              <col style={{ width: '10%' }} />  {/* Actions */}
            </colgroup>
            <thead>
              <tr>
                <th>User name</th>
                <th>Full name</th>
                <th>Email</th>
                <th>Country</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(u => (
                <tr key={u.user_id}>
                  <td className="truncate">{u.username}</td>
                  <td className="truncate">{u.full_name || '—'}</td>
                  <td className="truncate">{u.email || '—'}</td>
                  <td className="truncate">{u.country || '—'}</td>
                  <td>
                    <div className="roles-wrap">
                      {Array.isArray(u.roles) && u.roles.length
                        ? u.roles.map(r => <RoleBadge key={r} r={r} />)
                        : '—'}
                    </div>
                  </td>
                  <td className="center">
                    <button
                      type="button"
                      className="btn btn-small"
                      onClick={() => setSelectedId(u.user_id)}
                      aria-label={`View ${u.username}`}
                      title="View details"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Right-side detail sheet */}
      {selectedId && (
        <RightSheet
          title={detail?.username ? `User: ${detail.username}` : "User details"}
          onClose={() => { setSelectedId(null); setDetail(null); }}
        >
          {detailLoading && <p>Loading…</p>}
          {detailError && <p className="error">Error: {detailError}</p>}
          {!detailLoading && !detailError && detail && (
            <>
              <dl className="kv">
                <dt>User ID</dt><dd>{detail.user_id}</dd>
                <dt>Username</dt><dd>{detail.username}</dd>
                <dt>Full name</dt><dd>{detail.full_name || "—"}</dd>
                <dt>Email</dt><dd>{detail.email || "—"}</dd>
                <dt>Phone</dt><dd>{detail.phone_number || "—"}</dd>
                <dt>Address</dt><dd>{detail.address || "—"}</dd>
                <dt>Country</dt><dd>{detail.country || "—"}</dd>
                <dt>Roles</dt>
                <dd>
                  <div className="roles-wrap">
                    {Array.isArray(detail.roles) && detail.roles.length
                      ? detail.roles.map(r => <RoleBadge key={r} r={r} />)
                      : "—"}
                  </div>
                </dd>
              </dl>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  className="btn primary fullwidth"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Profile
                </button>
                <button
                  className="btn fullwidth"
                  onClick={() => setShowRolesModal(true)}
                >
                  Manage Roles
                </button>
                <button
                  className="btn fullwidth"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Reset Password
                </button>
              </div>
            </>
          )}
        </RightSheet>
      )}

      {/* Modals */}
      <CreateUserModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadUsers();
          setShowCreateModal(false);
        }}
        availableRoles={availableRoles}
        availableCountries={availableCountries}
      />
      <EditUserModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          loadUsers();
          if (selectedId) {
            getUser(selectedId).then(setDetail).catch(console.error);
          }
          setShowEditModal(false);
        }}
        user={detail}
        availableCountries={availableCountries}
      />
      <ManageRolesModal
        show={showRolesModal}
        onClose={() => setShowRolesModal(false)}
        onSuccess={() => {
          loadUsers();
          if (selectedId) {
            getUser(selectedId).then(setDetail).catch(console.error);
          }
          setShowRolesModal(false);
        }}
        user={detail}
        availableRoles={availableRoles}
      />
      <ResetPasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          setShowPasswordModal(false);
          alert('Password reset successfully');
        }}
        user={detail}
      />
    </div>
  );
}