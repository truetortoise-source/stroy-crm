import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const TABS = [
  { id: 'main', label: '🏠 Главная' },
  { id: 'objects', label: '🏗 Объекты' },
  { id: 'movements', label: '📋 Перемещения' },
  { id: 'invoices', label: '🧾 Счета' },
  { id: 'tasks', label: '📅 Задания' },
  { id: 'reports', label: '📊 Отчёты' },
  { id: 'timesheet', label: '🗓 Табель' },
];

const S = {
  bg: '#0d1117', panel: '#161b22', border: '#21262d',
  accent: '#f78166', green: '#3fb950', yellow: '#e3b341',
  blue: '#58a6ff', text: '#e6edf3', muted: '#8b949e', faint: '#30363d',
};

export default function App() {
  const [tab, setTab] = useState('main');
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchObjects();
  }, []);

  async function fetchObjects() {
    setLoading(true);
    const { data } = await supabase.from('objects').select('*').order('created_at', { ascending: false });
    setObjects(data || []);
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: S.bg, minHeight: '100vh', color: S.text }}>
      {/* Header */}
      <div style={{ background: S.panel, borderBottom: `1px solid ${S.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: S.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>CRM</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: S.text }}>🏗 СтройКонтроль</div>
        </div>
        <div style={{ fontSize: 12, color: S.green }}>● Подключено</div>
      </div>

      {/* Nav */}
      <div style={{ background: S.panel, borderBottom: `1px solid ${S.border}`, padding: '0 16px', display: 'flex', gap: 4, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${S.accent}` : '2px solid transparent',
            color: tab === t.id ? S.accent : S.muted, padding: '12px 14px', fontSize: 13,
            fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap'
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '20px 16px', maxWidth: 900, margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: S.muted }}>Загрузка...</div>
        ) : (
          <>
            {tab === 'main' && <MainTab objects={objects} />}
            {tab === 'objects' && <ObjectsTab objects={objects} onRefresh={fetchObjects} />}
            {tab === 'movements' && <MovementsTab objects={objects} />}
            {tab === 'invoices' && <InvoicesTab objects={objects} />}
            {tab === 'tasks' && <TasksTab objects={objects} />}
            {tab === 'reports' && <ReportsTab objects={objects} />}
            {tab === 'timesheet' && <TimesheetTab objects={objects} />}
          </>
        )}
      </div>
    </div>
  );
}

function MainTab({ objects }) {
  const active = objects.filter(o => !o.hidden && o.status === 'active');
  return (
    <div>
      <div style={{ fontSize: 14, color: S.muted, marginBottom: 16 }}>Активных объектов: {active.length}</div>
      {objects.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: S.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏗</div>
          <div>Объектов пока нет. Добавьте первый во вкладке «Объекты»</div>
        </div>
      )}
      {objects.map(o => {
        const daysLeft = o.end_date ? Math.ceil((new Date(o.end_date) - new Date()) / 86400000) : null;
        return (
          <div key={o.id} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: '16px 18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>{o.name}</div>
              <span style={{ background: o.status === 'active' ? '#3fb95022' : '#8b949e22', color: o.status === 'active' ? S.green : S.muted, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                {o.status === 'active' ? 'Активен' : 'Завершён'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 12, color: S.muted, flexWrap: 'wrap' }}>
              {o.address && <span>📍 {o.address}</span>}
              {o.foreman && <span>👷 {o.foreman}</span>}
              {daysLeft !== null && <span style={{ color: daysLeft < 30 ? S.accent : S.muted }}>⏱ {daysLeft > 0 ? `${daysLeft} дн. до сдачи` : 'Срок истёк'}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ObjectsTab({ objects, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', foreman: '', start_date: '', end_date: '', budget: '' });

  async function addObject() {
    if (!form.name) return;
    await supabase.from('objects').insert([{ ...form, budget: +form.budget || 0 }]);
    setForm({ name: '', address: '', foreman: '', start_date: '', end_date: '', budget: '' });
    setShowForm(false);
    onRefresh();
  }

  async function deleteObject(id) {
    if (!window.confirm('Удалить объект?')) return;
    await supabase.from('objects').delete().eq('id', id);
    onRefresh();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>Все объекты</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: S.accent, border: 'none', borderRadius: 8, color: '#fff', padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Добавить</button>
      </div>

      {showForm && (
        <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 20, marginBottom: 16 }}>
          {[
            { label: 'Название *', key: 'name', placeholder: 'ЖК Северный, ул. Ленина 12' },
            { label: 'Адрес', key: 'address', placeholder: 'ул. Ленина 12' },
            { label: 'Прораб', key: 'foreman', placeholder: 'Иванов А.В.' },
            { label: 'Дата начала', key: 'start_date', type: 'date' },
            { label: 'Дата сдачи по договору', key: 'end_date', type: 'date' },
            { label: 'Бюджет (₽)', key: 'budget', type: 'number', placeholder: '0' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>{f.label}</div>
              <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder} style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addObject} style={{ background: S.green, border: 'none', borderRadius: 8, color: '#fff', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Сохранить</button>
            <button onClick={() => setShowForm(false)} style={{ background: S.faint, border: 'none', borderRadius: 8, color: S.muted, padding: '10px 20px', fontSize: 13, cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      {objects.map(o => (
        <div key={o.id} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: '16px 18px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 6 }}>{o.name}</div>
              <div style={{ fontSize: 12, color: S.muted, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {o.address && <span>📍 {o.address}</span>}
                {o.foreman && <span>👷 {o.foreman}</span>}
                {o.end_date && <span>📅 Сдача: {o.end_date}</span>}
                {o.budget > 0 && <span>💰 {new Intl.NumberFormat('ru-RU').format(o.budget)} ₽</span>}
              </div>
            </div>
            <button onClick={() => deleteObject(o.id)} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
      ))}

      {objects.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: S.muted }}>Нет объектов. Нажмите «+ Добавить»</div>
      )}
    </div>
  );
}

function MovementsTab({ objects }) {
  const [movements, setMovements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ from: '', to: '', type: '' });
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), from_object_id: '', to_object_id: '', type: 'material', note: '', author: '' });

  useEffect(() => { fetchMovements(); }, []);

  async function fetchMovements() {
    const { data } = await supabase.from('movements').select('*').order('date', { ascending: false });
    setMovements(data || []);
  }

  async function addMovement() {
    await supabase.from('movements').insert([{ ...form, from_object_id: form.from_object_id || null, to_object_id: form.to_object_id || null }]);
    setShowForm(false);
    fetchMovements();
  }

  const objName = id => objects.find(o => o.id === id)?.name || '—';
  const filtered = movements.filter(m => {
    if (filter.from && m.from_object_id !== filter.from) return false;
    if (filter.to && m.to_object_id !== filter.to) return false;
    if (filter.type && m.type !== filter.type) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>Перемещения</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: S.accent, border: 'none', borderRadius: 8, color: '#fff', padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Добавить</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Откуда', key: 'from', options: objects },
          { label: 'Куда', key: 'to', options: objects },
        ].map(f => (
          <select key={f.key} value={filter[f.key]} onChange={e => setFilter({ ...filter, [f.key]: e.target.value })}
            style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
            <option value=''>{f.label}: все</option>
            {f.options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        ))}
        <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
          <option value=''>Тип: все</option>
          <option value='material'>Материал</option>
          <option value='tool'>Инструмент</option>
        </select>
      </div>

      {showForm && (
        <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 20, marginBottom: 16 }}>
          {[
            { label: 'Дата', key: 'date', type: 'date' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>{f.label}</div>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
            </div>
          ))}
          {[{ label: 'Откуда', key: 'from_object_id' }, { label: 'Куда', key: 'to_object_id' }].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>{f.label}</div>
              <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }}>
                <option value=''>Склад / Поставщик</option>
                {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          ))}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>Тип</div>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }}>
              <option value='material'>Материал</option>
              <option value='tool'>Инструмент</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>Примечание</div>
            <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder='Описание груза...'
              style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>Ответственный</div>
            <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder='Иванов А.В.'
              style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addMovement} style={{ background: S.green, border: 'none', borderRadius: 8, color: '#fff', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Сохранить</button>
            <button onClick={() => setShowForm(false)} style={{ background: S.faint, border: 'none', borderRadius: 8, color: S.muted, padding: '10px 20px', fontSize: 13, cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      {filtered.map(m => (
        <div key={m.id} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: '14px 16px', marginBottom: 10, borderLeft: `3px solid ${m.type === 'tool' ? S.blue : S.yellow}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: S.text }}>{m.type === 'tool' ? '🔧' : '📦'} {m.note || '—'}</span>
            <span style={{ fontSize: 11, color: S.muted }}>{m.date}</span>
          </div>
          <div style={{ fontSize: 12, color: S.muted }}>
            {objName(m.from_object_id) || 'Склад'} → {objName(m.to_object_id) || 'Склад'}
            {m.author && <span> · 👤 {m.author}</span>}
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: S.muted }}>Нет перемещений</div>}
    </div>
  );
}

function InvoicesTab({ objects }) {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ object_id: '', date: new Date().toISOString().slice(0,10), amount: '', note: '', status: 'pending' });

  useEffect(() => { fetchInvoices(); }, []);
  async function fetchInvoices() {
    const { data } = await supabase.from('invoices').select('*').order('date', { ascending: false });
    setInvoices(data || []);
  }
  async function addInvoice() {
    await supabase.from('invoices').insert([{ ...form, amount: +form.amount || 0 }]);
    setShowForm(false);
    fetchInvoices();
  }
  const statusColors = { pending: S.yellow, paid: S.green, overdue: S.accent };
  const statusLabels = { pending: 'Ожидает', paid: 'Оплачен', overdue: 'Просрочен' };
  const objName = id => objects.find(o => o.id === id)?.name || '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>Счета</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: S.accent, border: 'none', borderRadius: 8, color: '#fff', padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Добавить</button>
      </div>

      {showForm && (
        <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 20, marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>Объект</div>
            <select value={form.object_id} onChange={e => setForm({ ...form, object_id: e.target.value })}
              style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }}>
              <option value=''>Выберите объект</option>
              {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          {[{ label: 'Дата', key: 'date', type: 'date' }, { label: 'Сумма (₽)', key: 'amount', type: 'number', placeholder: '0' }, { label: 'Примечание', key: 'note', placeholder: 'Цемент, арматура...' }].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>{f.label}</div>
              <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>Статус</div>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }}>
              <option value='pending'>Ожидает оплаты</option>
              <option value='paid'>Оплачен</option>
              <option value='overdue'>Просрочен</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addInvoice} style={{ background: S.green, border: 'none', borderRadius: 8, color: '#fff', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Сохранить</button>
            <button onClick={() => setShowForm(false)} style={{ background: S.faint, border: 'none', borderRadius: 8, color: S.muted, padding: '10px 20px', fontSize: 13, cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      {invoices.map(inv => (
        <div key={inv.id} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{objName(inv.object_id)}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: S.yellow }}>{new Intl.NumberFormat('ru-RU').format(inv.amount)} ₽</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: S.muted }}>
            <span>{inv.note || '—'} · {inv.date}</span>
            <span style={{ background: `${statusColors[inv.status]}22`, color: statusColors[inv.status], borderRadius: 5, padding: '2px 7px', fontWeight: 700 }}>{statusLabels[inv.status]}</span>
          </div>
        </div>
      ))}
      {invoices.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: S.muted }}>Нет счетов</div>}
    </div>
  );
}

function TasksTab({ objects }) {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ object_id: '', employee_id: '', title: '', description: '', deadline: '', status: 'pending' });

  useEffect(() => { fetchTasks(); fetchEmployees(); }, []);
  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').order('deadline', { ascending: true });
    setTasks(data || []);
  }
  async function fetchEmployees() {
    const { data } = await supabase.from('employees').select('*');
    setEmployees(data || []);
  }
  async function addTask() {
    await supabase.from('tasks').insert([{ ...form }]);
    setShowForm(false);
    fetchTasks();
  }
  async function toggleTask(id, status) {
    await supabase.from('tasks').update({ status: status === 'done' ? 'pending' : 'done' }).eq('id', id);
    fetchTasks();
  }
  const objName = id => objects.find(o => o.id === id)?.name || '—';
  const empName = id => employees.find(e => e.id === id)?.name || '—';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>Задания</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: S.accent, border: 'none', borderRadius: 8, color: '#fff', padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Добавить</button>
      </div>

      {showForm && (
        <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 20, marginBottom: 16 }}>
          {[{ label: 'Объект', key: 'object_id', opts: objects }, { label: 'Сотрудник', key: 'employee_id', opts: employees }].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>{f.label}</div>
              <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }}>
                <option value=''>Выберите...</option>
                {f.opts.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          ))}
          {[{ label: 'Задание', key: 'title', placeholder: 'Описание задания' }, { label: 'Дедлайн', key: 'deadline', type: 'date' }].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>{f.label}</div>
              <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addTask} style={{ background: S.green, border: 'none', borderRadius: 8, color: '#fff', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Сохранить</button>
            <button onClick={() => setShowForm(false)} style={{ background: S.faint, border: 'none', borderRadius: 8, color: S.muted, padding: '10px 20px', fontSize: 13, cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      {tasks.map(t => {
        const overdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done';
        return (
          <div key={t.id} onClick={() => toggleTask(t.id, t.status)} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${overdue ? S.accent : S.border}`, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', opacity: t.status === 'done' ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.status === 'done' ? S.muted : S.text, textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>
                {t.status === 'done' ? '✅' : overdue ? '🔴' : '⬜'} {t.title}
              </span>
              {t.deadline && <span style={{ fontSize: 11, color: overdue ? S.accent : S.muted }}>{t.deadline}</span>}
            </div>
            <div style={{ fontSize: 12, color: S.muted }}>{objName(t.object_id)} · {empName(t.employee_id)}</div>
          </div>
        );
      })}
      {tasks.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: S.muted }}>Нет заданий</div>}
    </div>
  );
}

function ReportsTab({ objects }) {
  const [data, setData] = useState({ invoices: [], movements: [] });
  const [filter, setFilter] = useState({ object_id: '', from_date: '', to_date: '' });

  useEffect(() => { fetchData(); }, [filter]);
  async function fetchData() {
    let iq = supabase.from('invoices').select('*');
    let mq = supabase.from('movements').select('*');
    if (filter.object_id) iq = iq.eq('object_id', filter.object_id);
    if (filter.from_date) { iq = iq.gte('date', filter.from_date); mq = mq.gte('date', filter.from_date); }
    if (filter.to_date) { iq = iq.lte('date', filter.to_date); mq = mq.lte('date', filter.to_date); }
    const [{ data: inv }, { data: mov }] = await Promise.all([iq, mq]);
    setData({ invoices: inv || [], movements: mov || [] });
  }
  const totalInvoices = data.invoices.reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 16 }}>Отчёты</div>
      <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: S.muted, marginBottom: 12, textTransform: 'uppercase' }}>Фильтры</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={filter.object_id} onChange={e => setFilter({ ...filter, object_id: e.target.value })}
            style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
            <option value=''>Все объекты</option>
            {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <input type='date' value={filter.from_date} onChange={e => setFilter({ ...filter, from_date: e.target.value })}
            style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '8px 12px', fontSize: 12 }} />
          <input type='date' value={filter.to_date} onChange={e => setFilter({ ...filter, to_date: e.target.value })}
            style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '8px 12px', fontSize: 12 }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Сумма счетов', value: `${new Intl.NumberFormat('ru-RU').format(totalInvoices)} ₽`, color: S.yellow },
          { label: 'Счетов', value: data.invoices.length, color: S.blue },
          { label: 'Перемещений', value: data.movements.length, color: S.green },
        ].map((k, i) => (
          <div key={i} style={{ background: S.panel, borderRadius: 10, border: `1px solid ${S.border}`, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: S.muted, textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimesheetTab({ objects }) {
  const [employees, setEmployees] = useState([]);
  const [timesheet, setTimesheet] = useState([]);
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [showAddTime, setShowAddTime] = useState(false);
  const [empForm, setEmpForm] = useState({ name: '', role: '', rate: '' });
  const [timeForm, setTimeForm] = useState({ object_id: '', employee_id: '', date: new Date().toISOString().slice(0,10), start_time: '08:00', end_time: '17:00', status: 'worked', rate: '' });
  const [filter, setFilter] = useState({ object_id: '', employee_id: '' });

  useEffect(() => { fetchEmployees(); fetchTimesheet(); }, []);
  async function fetchEmployees() {
    const { data } = await supabase.from('employees').select('*').order('name');
    setEmployees(data || []);
  }
  async function fetchTimesheet() {
    const { data } = await supabase.from('timesheet').select('*').order('date', { ascending: false });
    setTimesheet(data || []);
  }
  async function addEmployee() {
    await supabase.from('employees').insert([{ ...empForm, rate: +empForm.rate || 0 }]);
    setShowAddEmp(false);
    setEmpForm({ name: '', role: '', rate: '' });
    fetchEmployees();
  }
  async function addTimeEntry() {
    await supabase.from('timesheet').insert([{ ...timeForm, rate: +timeForm.rate || 0 }]);
    setShowAddTime(false);
    fetchTimesheet();
  }

  const objName = id => objects.find(o => o.id === id)?.name || '—';
  const empName = id => employees.find(e => e.id === id)?.name || '—';
  const statusLabels = { worked: '✅ Работал', sick: '🤒 Больничный', vacation: '🏖 Отпуск', absent: '❌ Прогул' };

  const filtered = timesheet.filter(t => {
    if (filter.object_id && t.object_id !== filter.object_id) return false;
    if (filter.employee_id && t.employee_id !== filter.employee_id) return false;
    return true;
  });

  const totalFOT = filtered.filter(t => t.status === 'worked').reduce((s, t) => s + (t.rate || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>Табель</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAddEmp(!showAddEmp)} style={{ background: S.faint, border: 'none', borderRadius: 8, color: S.muted, padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}>+ Сотрудник</button>
          <button onClick={() => setShowAddTime(!showAddTime)} style={{ background: S.accent, border: 'none', borderRadius: 8, color: '#fff', padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Запись</button>
        </div>
      </div>

      <div style={{ fontSize: 13, color: S.yellow, fontWeight: 700, marginBottom: 16 }}>
        ФОТ за период: {new Intl.NumberFormat('ru-RU').format(totalFOT)} ₽
      </div>

      {showAddEmp && (
        <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: S.text, marginBottom: 12 }}>Новый сотрудник</div>
          {[{ label: 'Имя / Должность', key: 'name', placeholder: 'Иванов А.В. или Разнорабочий 1' }, { label: 'Роль', key: 'role', placeholder: 'Каменщик' }, { label: 'Ставка в день (₽)', key: 'rate', type: 'number', placeholder: '2500' }].map(f => (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>{f.label}</div>
              <input type={f.type || 'text'} value={empForm[f.key]} onChange={e => setEmpForm({ ...empForm, [f.key]: e.target.value })} placeholder={f.placeholder}
                style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addEmployee} style={{ background: S.green, border: 'none', borderRadius: 8, color: '#fff', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Сохранить</button>
            <button onClick={() => setShowAddEmp(false)} style={{ background: S.faint, border: 'none', borderRadius: 8, color: S.muted, padding: '10px 20px', fontSize: 13, cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      {showAddTime && (
        <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: S.text, marginBottom: 12 }}>Новая запись табеля</div>
          {[{ label: 'Объект', key: 'object_id', opts: objects }, { label: 'Сотрудник', key: 'employee_id', opts: employees }].map(f => (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>{f.label}</div>
              <select value={timeForm[f.key]} onChange={e => setTimeForm({ ...timeForm, [f.key]: e.target.value })}
                style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }}>
                <option value=''>Выберите...</option>
                {f.opts.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          ))}
          {[{ label: 'Дата', key: 'date', type: 'date' }, { label: 'Начало', key: 'start_time', type: 'time' }, { label: 'Конец', key: 'end_time', type: 'time' }, { label: 'Ставка (₽)', key: 'rate', type: 'number', placeholder: '2500' }].map(f => (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>{f.label}</div>
              <input type={f.type} value={timeForm[f.key]} onChange={e => setTimeForm({ ...timeForm, [f.key]: e.target.value })} placeholder={f.placeholder}
                style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase' }}>Статус</div>
            <select value={timeForm.status} onChange={e => setTimeForm({ ...timeForm, status: e.target.value })}
              style={{ background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }}>
              <option value='worked'>Работал</option>
              <option value='sick'>Больничный</option>
              <option value='vacation'>Отпуск</option>
              <option value='absent'>Прогул</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addTimeEntry} style={{ background: S.green, border: 'none', borderRadius: 8, color: '#fff', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Сохранить</button>
            <button onClick={() => setShowAddTime(false)} style={{ background: S.faint, border: 'none', borderRadius: 8, color: S.muted, padding: '10px 20px', fontSize: 13, cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={filter.object_id} onChange={e => setFilter({ ...filter, object_id: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
          <option value=''>Все объекты</option>
          {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <select value={filter.employee_id} onChange={e => setFilter({ ...filter, employee_id: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
          <option value=''>Все сотрудники</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {filtered.map(t => (
        <div key={t.id} style={{ background: S.panel, borderRadius: 10, border: `1px solid ${S.border}`, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>{empName(t.employee_id)}</div>
            <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{objName(t.object_id)} · {t.date} · {t.start_time}–{t.end_time}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: S.muted }}>{statusLabels[t.status]}</div>
            {t.rate > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: S.yellow }}>{new Intl.NumberFormat('ru-RU').format(t.rate)} ₽</div>}
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: S.muted }}>Нет записей</div>}
    </div>
  );
}
