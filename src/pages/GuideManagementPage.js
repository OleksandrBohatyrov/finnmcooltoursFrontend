import React, { useEffect, useState } from 'react';

function GuideManagementPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editId, setEditId] = useState(null);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const apiUrl = `${process.env.REACT_APP_API_URL}/api/guides`;

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = () => {
    fetch(apiUrl, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setGuides(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  // Обработчик отправки формы (создание или обновление)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const guideData = { email, userName, password };

    try {
      if (!editId) {
        // Создание
        const res = await fetch(apiUrl, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(guideData),
        });
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      } else {
        // Редактирование
        const res = await fetch(`${apiUrl}/${editId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(guideData),
        });
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      }

      // Очистим поля формы
      setEditId(null);
      setEmail('');
      setUserName('');
      setPassword('');
      // Обновим список
      loadGuides();
    } catch (err) {
      setError(err.message);
    }
  };

  // Удаление гида
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guide?')) return;

    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      // Обновим список
      loadGuides();
    } catch (err) {
      setError(err.message);
    }
  };

  // Начать редактирование
  const handleEdit = (guide) => {
    setEditId(guide.id);
    setEmail(guide.email);
    setUserName(guide.userName);
    setPassword(''); // пустое, если не хотим менять
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>Guide Management</h2>

      {/* Форма для добавления/редактирования */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>UserName:</label><br />
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password (leave blank to keep old):</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" style={{ marginTop: '0.5rem' }}>
          {editId ? 'Update Guide' : 'Add Guide'}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setEmail('');
              setUserName('');
              setPassword('');
            }}
            style={{ marginLeft: '1rem' }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Таблица гидов */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ textAlign: 'left' }}>Email</th>
            <th style={{ textAlign: 'left' }}>UserName</th>
            <th style={{ textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {guides.map(g => (
            <tr key={g.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{g.email}</td>
              <td>{g.userName}</td>
              <td>
                <button onClick={() => handleEdit(g)}>Edit</button>
                <button onClick={() => handleDelete(g.id)} style={{ marginLeft: '0.5rem' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GuideManagementPage;
