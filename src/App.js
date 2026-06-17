import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const TABS = [
  { id: 'main', label: '🏠 Главная' },
  { id: 'objects', label: '🏗 Объекты' },
  { id: 'employees', label: '👥 Сотрудники' },
  { id: 'movements', label: '📋 Перемещения' },
  { id: 'invoices', label: '🧾 Счета' },
  { id: 'tasks', label: '📅 Задания' },
  { id: 'reports', label: '📊 Отчёты' },
  { id: 'worktime', label: '⏱ Рабочее время' },
];

const S = {
  bg: '#0d1117', panel: '#161b22', border: '#21262d',
  accent: '#f78166', green: '#3fb950', yellow: '#e3b341',
  blue: '#58a6ff', text: '#e6edf3', muted: '#8b949e', faint: '#30363d',
};

const btnStyle = (color) => ({ background: color, border: 'none', borderRadius: 8, color: '#fff', padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' });
const inp = { background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none' };
const sel = { background: '#0d1117', border: '1px solid #21262d', color: '#e6edf3', borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none' };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      {children}
    </div>
  );
}

function DelBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: '#ef444488', cursor: 'pointer', fontSize: 16, padding: '4px 8px', borderRadius: 6, flexShrink: 0 }}
      onMouseEnter={e => e.target.style.color = '#ef4444'}
      onMouseLeave={e => e.target.style.color = '#ef444488'}>✕</button>
  );
}

async function uploadFile(file, folder) {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage.from('files').upload(fileName, file);
  if (error) { console.error(error); return null; }
  const { data: urlData } = supabase.storage.from('files').getPublicUrl(fileName);
  return urlData.publicUrl;
}

function FileUpload({ onUpload, uploading, setUploading }) {
  const fileRef = useRef();
  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file, 'docs');
    setUploading(false);
    if (url) onUpload(url);
  }
  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: 'none' }} />
      <button onClick={() => fileRef.current.click()} disabled={uploading}
        style={{ ...btnStyle(S.faint), width: '100%', opacity: uploading ? 0.6 : 1 }}>
        {uploading ? '⏳ Загрузка...' : '📎 Прикрепить фото или файл'}
      </button>
    </div>
  );
}

function FilePreview({ url, onRemove }) {
  if (!url) return null;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  return (
    <div style={{ background: S.faint, borderRadius: 8, padding: 10, display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
      {isImage
        ? <img src={url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
        : <span style={{ fontSize: 28 }}>📄</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <a href={url} target="_blank" rel="noreferrer" style={{ color: S.blue, fontSize: 12, textDecoration: 'none' }}>
          {isImage ? 'Просмотреть фото' : 'Открыть файл'}
        </a>
      </div>
      {onRemove && <DelBtn onClick={onRemove} />}
    </div>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function App() {
  const [tab, setTab] = useState('main');
  const [objects, setObjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: objs }, { data: emps }] = await Promise.all([
      supabase.from('objects').select('*').order('created_at', { ascending: false }),
      supabase.from('employees').select('*').order('name'),
    ]);
    setObjects(objs || []);
    setEmployees(emps || []);
    setLoading(false);
  }

  async function fetchEmployees() {
    const { data } = await supabase.from('employees').select('*').order('name');
    setEmployees(data || []);
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: S.bg, minHeight: '100vh', color: S.text }}>
      <div style={{ background: S.panel, borderBottom: `1px solid ${S.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: S.muted, letterSpacing: '1px', textTransform: 'uppercase' }}>БГ ИНЖИНИРИНГ</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: S.text }}>🏗 БГ Инжиниринг</div>
        </div>
        <div style={{ fontSize: 12, color: S.green }}>● Подключено</div>
      </div>

      {!isMobile && (
        <div style={{ background: S.panel, borderBottom: `1px solid ${S.border}`, padding: '0 16px', display: 'flex', gap: 4, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'none', border: 'none',
              borderBottom: tab === t.id ? `2px solid ${S.accent}` : '2px solid transparent',
              color: tab === t.id ? S.accent : S.muted,
              padding: '12px 14px', fontSize: 13,
              fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap'
            }}>{t.label}</button>
          ))}
        </div>
      )}

      <div style={{ padding: isMobile ? '12px 12px 80px' : '20px 16px', maxWidth: 900, margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: S.muted }}>Загрузка...</div>
        ) : (
          <>
            {tab === 'main' && <MainTab objects={objects} isMobile={isMobile} />}
            {tab === 'objects' && <ObjectsTab objects={objects} employees={employees} onRefresh={fetchAll} />}
            {tab === 'employees' && <EmployeesTab employees={employees} onRefresh={fetchEmployees} />}
            {tab === 'movements' && <MovementsTab objects={objects} />}
            {tab === 'invoices' && <InvoicesTab objects={objects} />}
            {tab === 'tasks' && <TasksTab objects={objects} employees={employees} />}
            {tab === 'reports' && <ReportsTab objects={objects} />}
            {tab === 'worktime' && <WorktimeTab objects={objects} employees={employees} />}
          </>
        )}
      </div>
      {/* Мобильная навигация снизу */}
      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: S.panel, borderTop: `1px solid ${S.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, background: 'none', border: 'none',
              color: tab === t.id ? S.accent : S.muted,
              padding: '8px 4px 6px', fontSize: 10, fontWeight: tab === t.id ? 700 : 400,
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              borderTop: tab === t.id ? `2px solid ${S.accent}` : '2px solid transparent',
            }}>
              <span style={{ fontSize: 18 }}>{t.label.split(' ')[0]}</span>
              <span style={{ fontSize: 9, whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 50, textOverflow: 'ellipsis' }}>{t.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ГЛАВНАЯ ───────────────────────────────────────────────────────────────────
function MainTab({ objects, isMobile }) {
  const [stats, setStats] = React.useState({ invoices: [], timesheet: [] });

  React.useEffect(() => {
    async function fetchStats() {
      const [{ data: inv }, { data: ts }] = await Promise.all([
        supabase.from('invoices').select('object_id, amount'),
        supabase.from('object_timesheet').select('object_id, rate, status'),
      ]);
      setStats({ invoices: inv || [], timesheet: ts || [] });
    }
    fetchStats();
  }, []);

  const fmt = v => new Intl.NumberFormat('ru-RU').format(v);
  const totalMaterials = stats.invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const totalFOT = stats.timesheet.filter(t => t.status === 'worked').reduce((s, t) => s + (t.rate || 0), 0);
  const totalContract = objects.reduce((s, o) => s + (o.contract_sum || 0), 0);
  const totalSpent = totalMaterials + totalFOT;
  const totalLeft = totalContract - totalSpent;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Сумма контрактов', value: `${fmt(totalContract)} ₽`, color: S.blue },
          { label: 'Материалы (счета)', value: `${fmt(totalMaterials)} ₽`, color: S.yellow },
          { label: 'ФОТ', value: `${fmt(totalFOT)} ₽`, color: S.accent },
          { label: 'Остаток', value: `${fmt(totalLeft)} ₽`, color: totalLeft >= 0 ? S.green : S.accent },
        ].map((k, i) => (
          <div key={i} style={{ background: S.panel, borderRadius: 10, border: `1px solid ${S.border}`, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: S.muted, textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: S.muted, marginBottom: 12 }}>Активных объектов: {objects.filter(o => o.status === 'active').length}</div>
      {objects.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: S.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏗</div>
          <div>Объектов пока нет. Добавьте первый во вкладке «Объекты»</div>
        </div>
      )}
      {objects.map(o => {
        const daysLeft = o.end_date ? Math.ceil((new Date(o.end_date) - new Date()) / 86400000) : null;
        const objMaterials = stats.invoices.filter(i => i.object_id === o.id).reduce((s, i) => s + (i.amount || 0), 0);
        const objFOT = stats.timesheet.filter(t => t.object_id === o.id && t.status === 'worked').reduce((s, t) => s + (t.rate || 0), 0);
        const objLeft = (o.contract_sum || 0) - objMaterials - objFOT;
        return (
          <div key={o.id} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: '16px 18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>{o.name}</div>
              <span style={{ background: o.status === 'active' ? '#3fb95022' : '#8b949e22', color: o.status === 'active' ? S.green : S.muted, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                {o.status === 'active' ? 'Активен' : 'Завершён'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: S.muted, flexWrap: 'wrap', marginBottom: 10 }}>
              {o.address && <span>📍 {o.address}</span>}
              {o.foreman && <span>👷 {o.foreman}</span>}
              {daysLeft !== null && <span style={{ color: daysLeft < 30 ? S.accent : S.muted }}>⏱ {daysLeft > 0 ? `${daysLeft} дн.` : 'Срок истёк'}</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { label: 'Контракт', value: `${fmt(o.contract_sum || 0)} ₽`, color: S.blue },
                { label: 'Материалы', value: `${fmt(objMaterials)} ₽`, color: S.yellow },
                { label: 'ФОТ', value: `${fmt(objFOT)} ₽`, color: S.accent },
                { label: 'Остаток', value: `${fmt(objLeft)} ₽`, color: objLeft >= 0 ? S.green : S.accent },
              ].map((k, i) => (
                <div key={i} style={{ background: S.bg, borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: S.muted, textTransform: 'uppercase', marginBottom: 3 }}>{k.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: k.color }}>{k.value}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── СОТРУДНИКИ ────────────────────────────────────────────────────────────────
function EmployeesTab({ employees, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', rate: '' });
  const [editForm, setEditForm] = useState({});

  async function addEmployee() {
    if (!form.name.trim()) return;
    await supabase.from('employees').insert([{ name: form.name.trim(), role: form.role.trim(), rate: +form.rate || 0, status: 'active' }]);
    setForm({ name: '', role: '', rate: '' });
    setShowForm(false);
    onRefresh();
  }

  async function saveEdit(id) {
    await supabase.from('employees').update({ name: editForm.name, role: editForm.role, rate: +editForm.rate || 0 }).eq('id', id);
    setEditId(null);
    onRefresh();
  }

  async function archiveEmployee(id) {
    await supabase.from('employees').update({ status: 'archived' }).eq('id', id);
    onRefresh();
  }

  async function restoreEmployee(id) {
    await supabase.from('employees').update({ status: 'active' }).eq('id', id);
    onRefresh();
  }

  async function deleteEmployee(id) {
    if (!window.confirm('Удалить навсегда?')) return;
    await supabase.from('employees').delete().eq('id', id);
    onRefresh();
  }

  const active = employees.filter(e => e.status !== 'archived');
  const archived = employees.filter(e => e.status === 'archived');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>Сотрудники</div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle(S.accent)}>+ Добавить</button>
      </div>

      {showForm && (
        <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 20, marginBottom: 16 }}>
          <Field label="Имя *">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder='Иванов Иван' style={inp} />
          </Field>
          <Field label="Роль / должность">
            <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder='Каменщик' style={inp} />
          </Field>
          <Field label="Ставка в день (₽)">
            <input type="number" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder='2500' style={inp} />
          </Field>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addEmployee} style={btnStyle(S.green)}>Сохранить</button>
            <button onClick={() => setShowForm(false)} style={btnStyle(S.faint)}>Отмена</button>
          </div>
        </div>
      )}

      {active.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: 60, color: S.muted }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
          <div>Сотрудников пока нет. Добавьте первого.</div>
        </div>
      )}

      {active.map(e => (
        <div key={e.id} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: '14px 18px', marginBottom: 10 }}>
          {editId === e.id ? (
            // Режим редактирования
            <div>
              <Field label="Имя">
                <input value={editForm.name} onChange={ev => setEditForm({ ...editForm, name: ev.target.value })} style={inp} />
              </Field>
              <Field label="Должность">
                <input value={editForm.role} onChange={ev => setEditForm({ ...editForm, role: ev.target.value })} style={inp} />
              </Field>
              <Field label="Ставка в день (₽)">
                <input type="number" value={editForm.rate} onChange={ev => setEditForm({ ...editForm, rate: ev.target.value })} style={inp} />
              </Field>
              <div style={{ fontSize: 11, color: S.muted, marginBottom: 10 }}>
                ℹ️ Изменение ставки не влияет на уже записанные дни в табеле
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => saveEdit(e.id)} style={btnStyle(S.green)}>Сохранить</button>
                <button onClick={() => setEditId(null)} style={btnStyle(S.faint)}>Отмена</button>
              </div>
            </div>
          ) : (
            // Режим просмотра
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{e.name}</div>
                <div style={{ fontSize: 12, color: S.muted, marginTop: 3, display: 'flex', gap: 12 }}>
                  {e.role && <span>💼 {e.role}</span>}
                  {e.rate > 0 && <span style={{ color: S.yellow }}>💰 {new Intl.NumberFormat('ru-RU').format(e.rate)} ₽/день</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={() => { setEditId(e.id); setEditForm({ name: e.name, role: e.role || '', rate: e.rate || '' }); }}
                  style={{ background: 'none', border: `1px solid ${S.faint}`, color: S.muted, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                  ✏️ Изменить
                </button>
                <button onClick={() => archiveEmployee(e.id)}
                  style={{ background: 'none', border: `1px solid ${S.faint}`, color: S.muted, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                  📦 В архив
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Архив */}
      {archived.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <button onClick={() => setShowArchive(!showArchive)}
            style={{ background: 'none', border: 'none', color: S.muted, fontSize: 13, cursor: 'pointer', marginBottom: 12 }}>
            {showArchive ? '▼' : '▶'} Архив ({archived.length})
          </button>
          {showArchive && archived.map(e => (
            <div key={e.id} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.faint}`, padding: '12px 18px', marginBottom: 8, opacity: 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: S.muted }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>
                    {e.role && <span>💼 {e.role} · </span>}
                    <span>📦 В архиве</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => restoreEmployee(e.id)}
                    style={{ background: 'none', border: `1px solid ${S.faint}`, color: S.muted, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                    ↩️ Восстановить
                  </button>
                  <DelBtn onClick={() => deleteEmployee(e.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ОБЪЕКТЫ (с кнопкой Табель) ───────────────────────────────────────────────
function ObjectsTab({ objects, employees, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [openTimesheetId, setOpenTimesheetId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const emptyForm = { name: '', address: '', foreman: '', start_date: '', end_date: '', budget: '', contract_sum: '' };
  const [form, setForm] = useState(emptyForm);

  async function addObject() {
    if (!form.name) return;
    await supabase.from('objects').insert([{ ...form, budget: +form.budget || 0, contract_sum: +form.contract_sum || 0 }]);
    setForm(emptyForm);
    setShowForm(false);
    onRefresh();
  }

  async function saveEdit(id) {
    await supabase.from('objects').update({
      name: editForm.name, address: editForm.address, foreman: editForm.foreman,
      start_date: editForm.start_date || null, end_date: editForm.end_date || null,
      budget: +editForm.budget || 0, contract_sum: +editForm.contract_sum || 0,
    }).eq('id', id);
    setEditId(null);
    onRefresh();
  }

  async function deleteObject(id) {
    if (!window.confirm('Удалить объект и все его данные?')) return;
    await supabase.from('objects').delete().eq('id', id);
    onRefresh();
  }

  const fields = [
    { label: 'Название *', key: 'name', placeholder: 'ЖК Северный' },
    { label: 'Адрес', key: 'address', placeholder: 'ул. Ленина 12' },
    { label: 'Прораб', key: 'foreman', placeholder: 'Иванов А.В.' },
    { label: 'Дата начала', key: 'start_date', type: 'date' },
    { label: 'Дата сдачи', key: 'end_date', type: 'date' },
    { label: 'Сумма контракта (₽)', key: 'contract_sum', type: 'number', placeholder: '0' },
    { label: 'Бюджет (₽)', key: 'budget', type: 'number', placeholder: '0' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>Все объекты</div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle(S.accent)}>+ Добавить</button>
      </div>

      {showForm && (
        <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 20, marginBottom: 16 }}>
          {fields.map(f => (
            <Field key={f.key} label={f.label}>
              <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} style={inp} />
            </Field>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addObject} style={btnStyle(S.green)}>Сохранить</button>
            <button onClick={() => setShowForm(false)} style={btnStyle(S.faint)}>Отмена</button>
          </div>
        </div>
      )}

      {objects.map(o => (
        <div key={o.id} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px' }}>
            {editId === o.id ? (
              <div>
                {fields.map(f => (
                  <Field key={f.key} label={f.label}>
                    <input type={f.type || 'text'} value={editForm[f.key] || ''} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} placeholder={f.placeholder} style={inp} />
                  </Field>
                ))}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => saveEdit(o.id)} style={btnStyle(S.green)}>Сохранить</button>
                  <button onClick={() => setEditId(null)} style={btnStyle(S.faint)}>Отмена</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 6 }}>{o.name}</div>
                  <div style={{ fontSize: 12, color: S.muted, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {o.address && <span>📍 {o.address}</span>}
                    {o.foreman && <span>👷 {o.foreman}</span>}
                    {o.end_date && <span>📅 Сдача: {o.end_date}</span>}
                    {o.contract_sum > 0 && <span style={{ color: S.blue }}>📄 Контракт: {new Intl.NumberFormat('ru-RU').format(o.contract_sum)} ₽</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => { setEditId(o.id); setEditForm({ name: o.name, address: o.address || '', foreman: o.foreman || '', start_date: o.start_date || '', end_date: o.end_date || '', budget: o.budget || '', contract_sum: o.contract_sum || '' }); }}
                    style={{ background: 'none', border: `1px solid ${S.faint}`, color: S.muted, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                    ✏️
                  </button>
                  <button onClick={() => setOpenTimesheetId(openTimesheetId === o.id ? null : o.id)}
                    style={{ ...btnStyle(openTimesheetId === o.id ? S.blue : S.faint), fontSize: 12, padding: '6px 12px' }}>
                    🗓 Табель
                  </button>
                  <DelBtn onClick={() => deleteObject(o.id)} />
                </div>
              </div>
            )}
          </div>
          {openTimesheetId === o.id && (
            <ObjectTimesheet object={o} employees={employees} />
          )}
        </div>
      ))}
      {objects.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: S.muted }}>Нет объектов</div>}
    </div>
  );
}

// ─── ТАБЕЛЬ ОБЪЕКТА ────────────────────────────────────────────────────────────
function ObjectTimesheet({ object, employees }) {
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee_id: '', manual_name: '', is_manual: false, start_time: '08:00', end_time: '17:00', rate: '', status: 'worked' });

  useEffect(() => { fetchEntries(); }, [selectedDate]);

  async function fetchEntries() {
    const { data } = await supabase.from('object_timesheet')
      .select('*')
      .eq('object_id', object.id)
      .eq('date', selectedDate)
      .order('created_at');
    setEntries(data || []);
  }

  async function copyPrevDay() {
    // Найти предыдущий день с записями
    const { data } = await supabase.from('object_timesheet')
      .select('*')
      .eq('object_id', object.id)
      .lt('date', selectedDate)
      .order('date', { ascending: false })
      .limit(50);

    if (!data || data.length === 0) { alert('Нет записей в предыдущих днях'); return; }

    // Берём записи последнего дня
    const lastDate = data[0].date;
    const prevEntries = data.filter(d => d.date === lastDate);

    // Вставляем на выбранную дату
    const toInsert = prevEntries.map(e => ({
      object_id: object.id,
      date: selectedDate,
      employee_id: e.employee_id,
      manual_name: e.manual_name,
      is_manual: e.is_manual,
      start_time: e.start_time,
      end_time: e.end_time,
      rate: e.rate,
      status: e.status,
    }));

    await supabase.from('object_timesheet').insert(toInsert);
    fetchEntries();
  }

  async function addEntry() {
    if (!form.is_manual && !form.employee_id) return;
    if (form.is_manual && !form.manual_name.trim()) return;

    const emp = employees.find(e => e.id === form.employee_id);
    await supabase.from('object_timesheet').insert([{
      object_id: object.id,
      date: selectedDate,
      employee_id: form.is_manual ? null : form.employee_id,
      manual_name: form.is_manual ? form.manual_name.trim() : null,
      is_manual: form.is_manual,
      start_time: form.start_time,
      end_time: form.end_time,
      rate: +form.rate || (emp?.rate || 0),
      status: form.status,
    }]);
    setForm({ employee_id: '', manual_name: '', is_manual: false, start_time: '08:00', end_time: '17:00', rate: '', status: 'worked' });
    setShowForm(false);
    fetchEntries();
  }

  async function deleteEntry(id) {
    await supabase.from('object_timesheet').delete().eq('id', id);
    fetchEntries();
  }

  const [editEntryId, setEditEntryId] = useState(null);
  const [editEntryForm, setEditEntryForm] = useState({});

  async function saveEntryEdit(id) {
    await supabase.from('object_timesheet').update({
      start_time: editEntryForm.start_time,
      end_time: editEntryForm.end_time,
      rate: +editEntryForm.rate || 0,
      status: editEntryForm.status,
    }).eq('id', id);
    setEditEntryId(null);
    fetchEntries();
  }

  const statusLabels = { worked: '✅ Работал', sick: '🤒 Больничный', vacation: '🏖 Отпуск', absent: '❌ Прогул' };
  const statusColors = { worked: S.green, sick: S.blue, vacation: S.yellow, absent: S.accent };
  const empName = id => employees.find(e => e.id === id)?.name || '—';
  const totalFOT = entries.filter(e => e.status === 'worked').reduce((s, e) => s + (e.rate || 0), 0);

  return (
    <div style={{ borderTop: `1px solid ${S.border}`, background: '#0d111788', padding: '16px 18px' }}>
      {/* Шапка с датой */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          style={{ ...inp, width: 'auto', fontSize: 13 }} />
        <div style={{ fontSize: 13, color: S.yellow, fontWeight: 700 }}>
          ФОТ за день: {new Intl.NumberFormat('ru-RU').format(totalFOT)} ₽
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {entries.length === 0 && (
            <button onClick={copyPrevDay} style={{ ...btnStyle(S.faint), fontSize: 12, padding: '6px 12px' }}>
              📋 Скопировать предыдущий день
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)} style={{ ...btnStyle(S.green), fontSize: 12, padding: '6px 12px' }}>
            + Добавить
          </button>
        </div>
      </div>

      {/* Форма добавления */}
      {showForm && (
        <div style={{ background: S.panel, borderRadius: 10, border: `1px solid ${S.border}`, padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={() => setForm({ ...form, is_manual: false })}
              style={{ ...btnStyle(form.is_manual ? S.faint : S.blue), fontSize: 12, padding: '6px 12px' }}>
              Из справочника
            </button>
            <button onClick={() => setForm({ ...form, is_manual: true })}
              style={{ ...btnStyle(form.is_manual ? S.blue : S.faint), fontSize: 12, padding: '6px 12px' }}>
              Вручную (техника/другое)
            </button>
          </div>

          {form.is_manual ? (
            <Field label="Имя / Техника">
              <input value={form.manual_name} onChange={e => setForm({ ...form, manual_name: e.target.value })} placeholder='Экскаватор CAT / Разнорабочий' style={inp} />
            </Field>
          ) : (
            <Field label="Сотрудник">
              <select value={form.employee_id} onChange={e => {
                const emp = employees.find(emp => emp.id === e.target.value);
                setForm({ ...form, employee_id: e.target.value, rate: emp?.rate?.toString() || '' });
              }} style={sel}>
                <option value=''>Выберите сотрудника</option>
                {employees.filter(e => e.status !== 'archived').map(e => <option key={e.id} value={e.id}>{e.name}{e.role ? ` — ${e.role}` : ''}</option>)}
              </select>
            </Field>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Начало">
              <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} style={inp} />
            </Field>
            <Field label="Конец">
              <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} style={inp} />
            </Field>
          </div>

          <Field label="Ставка (₽/день)">
            <input type="number" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder='2500' style={inp} />
          </Field>

          <Field label="Статус">
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={sel}>
              <option value='worked'>Работал</option>
              <option value='sick'>Больничный</option>
              <option value='vacation'>Отпуск</option>
              <option value='absent'>Прогул</option>
            </select>
          </Field>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addEntry} style={btnStyle(S.green)}>Сохранить</button>
            <button onClick={() => setShowForm(false)} style={btnStyle(S.faint)}>Отмена</button>
          </div>
        </div>
      )}

      {/* Список записей */}
      {entries.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: 20, color: S.muted, fontSize: 13 }}>
          Нет записей на {selectedDate}. Добавьте или скопируйте предыдущий день.
        </div>
      )}

      {entries.map(e => (
        <div key={e.id} style={{ padding: '10px 0', borderBottom: `1px solid ${S.faint}` }}>
          {editEntryId === e.id ? (
            // Режим редактирования строки
            <div style={{ background: S.panel, borderRadius: 8, padding: 12, marginTop: 4 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <Field label="Начало">
                  <input type="time" value={editEntryForm.start_time} onChange={ev => setEditEntryForm({ ...editEntryForm, start_time: ev.target.value })} style={inp} />
                </Field>
                <Field label="Конец">
                  <input type="time" value={editEntryForm.end_time} onChange={ev => setEditEntryForm({ ...editEntryForm, end_time: ev.target.value })} style={inp} />
                </Field>
              </div>
              <Field label="Ставка (₽)">
                <input type="number" value={editEntryForm.rate} onChange={ev => setEditEntryForm({ ...editEntryForm, rate: ev.target.value })} style={inp} />
              </Field>
              <Field label="Статус">
                <select value={editEntryForm.status} onChange={ev => setEditEntryForm({ ...editEntryForm, status: ev.target.value })} style={sel}>
                  <option value='worked'>Работал</option>
                  <option value='sick'>Больничный</option>
                  <option value='vacation'>Отпуск</option>
                  <option value='absent'>Прогул</option>
                </select>
              </Field>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => saveEntryEdit(e.id)} style={{ ...btnStyle(S.green), fontSize: 12, padding: '6px 12px' }}>Сохранить</button>
                <button onClick={() => setEditEntryId(null)} style={{ ...btnStyle(S.faint), fontSize: 12, padding: '6px 12px' }}>Отмена</button>
              </div>
            </div>
          ) : (
            // Режим просмотра строки
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>
                  {e.is_manual ? `⚙️ ${e.manual_name}` : `👤 ${empName(e.employee_id)}`}
                </div>
                <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>
                  {e.start_time?.slice(0, 5)} – {e.end_time?.slice(0, 5)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: statusColors[e.status], fontWeight: 600 }}>{statusLabels[e.status]}</span>
                {e.rate > 0 && <span style={{ fontSize: 13, color: S.yellow, fontWeight: 700 }}>{new Intl.NumberFormat('ru-RU').format(e.rate)} ₽</span>}
                <button onClick={() => { setEditEntryId(e.id); setEditEntryForm({ start_time: e.start_time?.slice(0,5), end_time: e.end_time?.slice(0,5), rate: e.rate || '', status: e.status }); }}
                  style={{ background: 'none', border: `1px solid ${S.faint}`, color: S.muted, borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>
                  ✏️
                </button>
                <DelBtn onClick={() => deleteEntry(e.id)} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── РАБОЧЕЕ ВРЕМЯ (сводка) ────────────────────────────────────────────────────
function WorktimeTab({ objects, employees }) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [filter, setFilter] = useState({ employee_ids: [] });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Генерируем последние 12 месяцев
  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) });
  }

  const fromDate = new Date(selectedMonth.year, selectedMonth.month, 1).toISOString().slice(0, 10);
  const toDate = new Date(selectedMonth.year, selectedMonth.month + 1, 0).toISOString().slice(0, 10);

  useEffect(() => { fetchEntries(); }, [selectedMonth, filter.employee_ids]);

  async function fetchEntries() {
    setLoading(true);
    const { data } = await supabase.from('object_timesheet').select('*')
      .gte('date', fromDate).lte('date', toDate).order('date');
    setEntries(data || []);
    setLoading(false);
  }

  const objName = id => objects.find(o => o.id === id)?.name || '—';
  const empName = id => employees.find(e => e.id === id)?.name || id;
  const fmt = v => new Intl.NumberFormat('ru-RU').format(v);

  const filtered = filter.employee_ids.length > 0
    ? entries.filter(e => filter.employee_ids.includes(e.employee_id))
    : entries;

  const byObject = {};
  filtered.forEach(e => {
    if (!byObject[e.object_id]) byObject[e.object_id] = [];
    byObject[e.object_id].push(e);
  });

  const totalFOT = filtered.filter(e => e.status === 'worked').reduce((s, e) => s + (e.rate || 0), 0);
  const statusLabels = { worked: '✅', sick: '🤒', vacation: '🏖', absent: '❌' };

  function toggleEmployee(id) {
    setFilter(f => ({
      ...f,
      employee_ids: f.employee_ids.includes(id)
        ? f.employee_ids.filter(x => x !== id)
        : [...f.employee_ids, id]
    }));
  }

  async function exportPDF() {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Шрифт — используем встроенный helvetica, кириллицу транслитерируем
    const monthLabel = months.find(m => m.year === selectedMonth.year && m.month === selectedMonth.month)?.label || '';

    // Заголовок
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BG Inzhiniring — Tabel za ' + translitMonth(monthLabel), 14, 15);

    // Получаем дни месяца
    const daysInMonth = new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Определяем кого выводить
    const selectedEmps = filter.employee_ids.length > 0
      ? employees.filter(e => filter.employee_ids.includes(e.id))
      : employees.filter(e => {
          return filtered.some(f => f.employee_id === e.id);
        });

    // Строим строки таблицы
    const rows = [];
    selectedEmps.forEach(emp => {
      // Группируем по объектам
      const empEntries = filtered.filter(e => e.employee_id === emp.id);
      const empObjects = [...new Set(empEntries.map(e => e.object_id))];

      empObjects.forEach((objId, objIdx) => {
        const objEntries = empEntries.filter(e => e.object_id === objId);
        const workedDays = objEntries.filter(e => e.status === 'worked').length;
        const totalPay = objEntries.filter(e => e.status === 'worked').reduce((s, e) => s + (e.rate || 0), 0);

        const row = [
          objIdx === 0 ? translit(emp.name) : '',
          translit(objName(objId)),
        ];

        days.forEach(d => {
          const dateStr = `${selectedMonth.year}-${String(selectedMonth.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const entry = objEntries.find(e => e.date === dateStr);
          if (!entry) row.push('');
          else if (entry.status === 'worked') row.push('R');
          else if (entry.status === 'sick') row.push('B');
          else if (entry.status === 'vacation') row.push('O');
          else if (entry.status === 'absent') row.push('П');
          else row.push('');
        });

        row.push(workedDays.toString());
        row.push(fmt(totalPay) + ' R');
        rows.push(row);
      });

      if (empObjects.length === 0) {
        const row = [translit(emp.name), '—', ...days.map(() => ''), '0', '0 R'];
        rows.push(row);
      }
    });

    // Итого
    const totalRow = ['ИТОГО', '', ...days.map(() => ''), '', fmt(totalFOT) + ' R'];
    rows.push(totalRow);

    const head = [['FIO', 'Obekt', ...days.map(d => String(d)), 'Dn', 'Summa']];

    autoTable(doc, {
      head,
      body: rows,
      startY: 22,
      theme: 'grid',
      styles: { fontSize: 6.5, cellPadding: 1.2, halign: 'center' },
      headStyles: { fillColor: [22, 27, 34], textColor: [230, 237, 243], fontStyle: 'bold', fontSize: 7 },
      columnStyles: {
        0: { halign: 'left', cellWidth: 28 },
        1: { halign: 'left', cellWidth: 24 },
        [days.length + 2]: { cellWidth: 8 },
        [days.length + 3]: { cellWidth: 20 },
      },
      didParseCell: (data) => {
        if (data.cell.raw === 'R') { data.cell.styles.fillColor = [63, 185, 80]; data.cell.styles.textColor = [255,255,255]; }
        else if (data.cell.raw === 'B') { data.cell.styles.fillColor = [88, 166, 255]; data.cell.styles.textColor = [255,255,255]; }
        else if (data.cell.raw === 'O') { data.cell.styles.fillColor = [227, 179, 65]; data.cell.styles.textColor = [255,255,255]; }
        else if (data.cell.raw === 'П') { data.cell.styles.fillColor = [247, 129, 102]; data.cell.styles.textColor = [255,255,255]; }
        if (data.row.index === rows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [22, 27, 34];
          data.cell.styles.textColor = [227, 179, 65];
        }
      },
      foot: [['R = rabotal', 'B = bolnichniy', 'O = otpusk', 'П = progul']],
      footStyles: { fontSize: 6, fillColor: [13, 17, 23], textColor: [139, 148, 158] },
    });

    doc.save(`tabel_${selectedMonth.year}_${String(selectedMonth.month + 1).padStart(2, '0')}.pdf`);
  }

  function translit(str) {
    if (!str) return '';
    const map = { 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya' };
    return str.split('').map(c => map[c.toLowerCase()] ? (c === c.toUpperCase() ? map[c.toLowerCase()].charAt(0).toUpperCase() + map[c.toLowerCase()].slice(1) : map[c.toLowerCase()]) : c).join('');
  }

  function translitMonth(str) {
    return translit(str);
  }

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 16 }}>⏱ Рабочее время</div>

      {/* Выбор месяца */}
      <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: S.muted, marginBottom: 10, textTransform: 'uppercase' }}>Месяц</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {months.map(m => (
            <button key={`${m.year}-${m.month}`}
              onClick={() => setSelectedMonth({ year: m.year, month: m.month })}
              style={{ ...btnStyle(selectedMonth.year === m.year && selectedMonth.month === m.month ? S.blue : S.faint), fontSize: 12, padding: '6px 12px', textTransform: 'capitalize' }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Сотрудники */}
      <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: S.muted, textTransform: 'uppercase' }}>Сотрудники {filter.employee_ids.length > 0 && `(выбрано: ${filter.employee_ids.length})`}</div>
          {filter.employee_ids.length > 0 && (
            <button onClick={() => setFilter(f => ({ ...f, employee_ids: [] }))}
              style={{ background: 'none', border: 'none', color: S.muted, fontSize: 12, cursor: 'pointer' }}>✕ Сброс</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {employees.filter(e => e.status !== 'archived').map(e => (
            <button key={e.id} onClick={() => toggleEmployee(e.id)}
              style={{ ...btnStyle(filter.employee_ids.includes(e.id) ? S.blue : S.faint), fontSize: 12, padding: '5px 10px' }}>
              {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* Итог + кнопка PDF */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'stretch' }}>
        {[
          { label: 'ФОТ за период', value: `${fmt(totalFOT)} ₽`, color: S.yellow },
          { label: 'Записей', value: filtered.length, color: S.blue },
          { label: 'Объектов', value: Object.keys(byObject).length, color: S.green },
        ].map((k, i) => (
          <div key={i} style={{ background: S.panel, borderRadius: 10, border: `1px solid ${S.border}`, padding: '14px 16px', flex: 1, minWidth: 100 }}>
            <div style={{ fontSize: 10, color: S.muted, textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
        <button onClick={exportPDF}
          style={{ ...btnStyle(S.green), display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '14px 20px', borderRadius: 10 }}>
          📄 Выгрузить PDF
        </button>
      </div>

      {/* Сводка по объектам */}
      {loading && <div style={{ textAlign: 'center', padding: 30, color: S.muted }}>Загрузка...</div>}

      {!loading && Object.keys(byObject).length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: S.muted }}>Нет записей за выбранный период</div>
      )}

      {!loading && Object.entries(byObject).map(([objId, objEntries]) => {
        const objFOT = objEntries.filter(e => e.status === 'worked').reduce((s, e) => s + (e.rate || 0), 0);
        return (
          <div key={objId} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, marginBottom: 14, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${S.faint}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>🏗 {objName(objId)}</div>
              <div style={{ fontSize: 13, color: S.yellow, fontWeight: 700 }}>{fmt(objFOT)} ₽</div>
            </div>
            {objEntries.map(e => (
              <div key={e.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${S.faint}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: S.text, fontWeight: 600 }}>
                    {e.is_manual ? `⚙️ ${e.manual_name}` : `👤 ${empName(e.employee_id)}`}
                  </div>
                  <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>
                    📅 {e.date} · {e.start_time?.slice(0, 5)} – {e.end_time?.slice(0, 5)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: S.muted }}>{statusLabels[e.status]} {e.status === 'worked' ? 'Работал' : e.status === 'sick' ? 'Больничный' : e.status === 'vacation' ? 'Отпуск' : 'Прогул'}</div>
                  {e.rate > 0 && <div style={{ fontSize: 13, color: S.yellow, fontWeight: 700 }}>{fmt(e.rate)} ₽</div>}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
// ─── ПЕРЕМЕЩЕНИЯ ───────────────────────────────────────────────────────────────
function MovementsTab({ objects }) {
  const [movements, setMovements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ from: '', to: '', type: '', from_date: '', to_date: '' });
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), from_object_id: '', to_object_id: '', type: 'material', note: '', author: '', file_url: '' });

  useEffect(() => { fetchMovements(); }, []);

  async function fetchMovements() {
    const { data } = await supabase.from('movements').select('*').order('date', { ascending: false });
    setMovements(data || []);
  }

  async function addMovement() {
    await supabase.from('movements').insert([{ ...form, from_object_id: form.from_object_id || null, to_object_id: form.to_object_id || null }]);
    setForm({ date: new Date().toISOString().slice(0, 10), from_object_id: '', to_object_id: '', type: 'material', note: '', author: '', file_url: '' });
    setShowForm(false);
    fetchMovements();
  }

  async function deleteMovement(id) {
    if (!window.confirm('Удалить перемещение?')) return;
    await supabase.from('movements').delete().eq('id', id);
    fetchMovements();
  }

  const objName = id => objects.find(o => o.id === id)?.name || 'Склад';
  const filtered = movements.filter(m => {
    if (filter.from && m.from_object_id !== filter.from) return false;
    if (filter.to && m.to_object_id !== filter.to) return false;
    if (filter.type && m.type !== filter.type) return false;
    if (filter.from_date && m.date < filter.from_date) return false;
    if (filter.to_date && m.date > filter.to_date) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>Перемещения</div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle(S.accent)}>+ Добавить</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[{ label: 'Откуда', key: 'from' }, { label: 'Куда', key: 'to' }].map(f => (
          <select key={f.key} value={filter[f.key]} onChange={e => setFilter({ ...filter, [f.key]: e.target.value })}
            style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
            <option value=''>{f.label}: все</option>
            {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        ))}
        <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
          <option value=''>Тип: все</option>
          <option value='material'>Материал</option>
          <option value='tool'>Инструмент</option>
        </select>
        <input type='date' value={filter.from_date} onChange={e => setFilter({ ...filter, from_date: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '8px 12px', fontSize: 12 }} />
        <input type='date' value={filter.to_date} onChange={e => setFilter({ ...filter, to_date: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '8px 12px', fontSize: 12 }} />
      </div>

      {showForm && (
        <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 20, marginBottom: 16 }}>
          <Field label="Дата"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inp} /></Field>
          {[{ label: 'Откуда', key: 'from_object_id' }, { label: 'Куда', key: 'to_object_id' }].map(f => (
            <Field key={f.key} label={f.label}>
              <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={sel}>
                <option value=''>Склад / Поставщик</option>
                {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </Field>
          ))}
          <Field label="Тип">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={sel}>
              <option value='material'>Материал</option>
              <option value='tool'>Инструмент</option>
            </select>
          </Field>
          <Field label="Описание"><input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder='Что везём...' style={inp} /></Field>
          <Field label="Ответственный"><input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder='Иванов А.В.' style={inp} /></Field>
          <Field label="Фото или файл накладной">
            <FileUpload onUpload={url => setForm({ ...form, file_url: url })} uploading={uploading} setUploading={setUploading} />
            <FilePreview url={form.file_url} onRemove={() => setForm({ ...form, file_url: '' })} />
          </Field>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={addMovement} disabled={uploading} style={btnStyle(S.green)}>Сохранить</button>
            <button onClick={() => setShowForm(false)} style={btnStyle(S.faint)}>Отмена</button>
          </div>
        </div>
      )}

      {filtered.map(m => (
        <div key={m.id} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: '14px 16px', marginBottom: 10, borderLeft: `3px solid ${m.type === 'tool' ? S.blue : S.yellow}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: S.text, marginBottom: 4 }}>{m.type === 'tool' ? '🔧' : '📦'} {m.note || '—'}</div>
              <div style={{ fontSize: 12, color: S.muted }}>{objName(m.from_object_id)} → {objName(m.to_object_id)} · {m.date}{m.author && ` · 👤 ${m.author}`}</div>
              <FilePreview url={m.file_url} />
            </div>
            <DelBtn onClick={() => deleteMovement(m.id)} />
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: S.muted }}>Нет перемещений</div>}
    </div>
  );
}

// ─── СЧЕТА ─────────────────────────────────────────────────────────────────────
function InvoicesTab({ objects }) {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filter, setFilter] = useState({ object_id: '', supplier: '', from_date: '', to_date: '' });
  const emptyForm = { object_id: '', date: new Date().toISOString().slice(0, 10), amount: '', note: '', supplier: '', status: 'pending', file_url: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchInvoices(); }, []);
  async function fetchInvoices() {
    const { data } = await supabase.from('invoices').select('*').order('date', { ascending: false });
    setInvoices(data || []);
  }
  async function addInvoice() {
    if (!form.object_id || !form.amount) return;
    await supabase.from('invoices').insert([{ ...form, amount: +form.amount }]);
    setForm(emptyForm);
    setShowForm(false);
    fetchInvoices();
  }
  async function saveEdit(id) {
    await supabase.from('invoices').update({ ...editForm, amount: +editForm.amount }).eq('id', id);
    setEditId(null);
    fetchInvoices();
  }
  async function deleteInvoice(id) {
    if (!window.confirm('Удалить счёт?')) return;
    await supabase.from('invoices').delete().eq('id', id);
    fetchInvoices();
  }

  const statusColors = { pending: S.yellow, paid: S.green, overdue: S.accent };
  const statusLabels = { pending: 'Ожидает', paid: 'Оплачен', overdue: 'Просрочен' };
  const objName = id => objects.find(o => o.id === id)?.name || '—';

  const filtered = invoices.filter(inv => {
    if (filter.object_id && inv.object_id !== filter.object_id) return false;
    if (filter.supplier && !(inv.supplier || '').toLowerCase().includes(filter.supplier.toLowerCase())) return false;
    if (filter.from_date && inv.date < filter.from_date) return false;
    if (filter.to_date && inv.date > filter.to_date) return false;
    return true;
  });

  const InvoiceForm = ({ data, setData, onSave, onCancel, uploading, setUploading }) => (
    <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 20, marginBottom: 16 }}>
      <Field label="Объект">
        <select value={data.object_id} onChange={e => setData({ ...data, object_id: e.target.value })} style={sel}>
          <option value=''>Выберите объект</option>
          {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </Field>
      <Field label="Поставщик"><input value={data.supplier || ''} onChange={e => setData({ ...data, supplier: e.target.value })} placeholder='ООО Стройматериалы' style={inp} /></Field>
      <Field label="Дата"><input type="date" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} style={inp} /></Field>
      <Field label="Сумма (₽)"><input type="number" value={data.amount} onChange={e => setData({ ...data, amount: e.target.value })} placeholder='0' style={inp} /></Field>
      <Field label="Примечание"><input value={data.note} onChange={e => setData({ ...data, note: e.target.value })} placeholder='Цемент, арматура...' style={inp} /></Field>
      <Field label="Статус">
        <select value={data.status} onChange={e => setData({ ...data, status: e.target.value })} style={sel}>
          <option value='pending'>Ожидает оплаты</option>
          <option value='paid'>Оплачен</option>
          <option value='overdue'>Просрочен</option>
        </select>
      </Field>
      <Field label="Фото или скан счёта">
        <FileUpload onUpload={url => setData({ ...data, file_url: url })} uploading={uploading} setUploading={setUploading} />
        <FilePreview url={data.file_url} onRemove={() => setData({ ...data, file_url: '' })} />
      </Field>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={onSave} disabled={uploading} style={btnStyle(S.green)}>Сохранить</button>
        <button onClick={onCancel} style={btnStyle(S.faint)}>Отмена</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>Счета</div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle(S.accent)}>+ Добавить</button>
      </div>

      {/* Фильтры */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={filter.object_id} onChange={e => setFilter({ ...filter, object_id: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
          <option value=''>Все объекты</option>
          {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <input value={filter.supplier} onChange={e => setFilter({ ...filter, supplier: e.target.value })} placeholder='Поставщик...'
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.text, borderRadius: 8, padding: '8px 12px', fontSize: 12 }} />
        <input type='date' value={filter.from_date} onChange={e => setFilter({ ...filter, from_date: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '8px 12px', fontSize: 12 }} />
        <input type='date' value={filter.to_date} onChange={e => setFilter({ ...filter, to_date: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '8px 12px', fontSize: 12 }} />
        {(filter.object_id || filter.supplier || filter.from_date || filter.to_date) &&
          <button onClick={() => setFilter({ object_id: '', supplier: '', from_date: '', to_date: '' })} style={{ ...btnStyle(S.faint), fontSize: 12, padding: '6px 10px' }}>✕ Сброс</button>}
      </div>

      {showForm && <InvoiceForm data={form} setData={setForm} onSave={addInvoice} onCancel={() => setShowForm(false)} uploading={uploading} setUploading={setUploading} />}

      {filtered.map(inv => {
        const st = statusColors[inv.status];
        return (
          <div key={inv.id} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: '14px 16px', marginBottom: 10 }}>
            {editId === inv.id ? (
              <InvoiceForm data={editForm} setData={setEditForm} onSave={() => saveEdit(inv.id)} onCancel={() => setEditId(null)} uploading={uploading} setUploading={setUploading} />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{objName(inv.object_id)}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: S.yellow }}>{new Intl.NumberFormat('ru-RU').format(inv.amount)} ₽</span>
                  </div>
                  <div style={{ fontSize: 12, color: S.muted, marginBottom: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {inv.supplier && <span>🏭 {inv.supplier}</span>}
                    <span>{inv.note || '—'}</span>
                    <span>📅 {inv.date}</span>
                    <span style={{ background: `${st}22`, color: st, borderRadius: 5, padding: '2px 7px', fontWeight: 700 }}>{statusLabels[inv.status]}</span>
                  </div>
                  <FilePreview url={inv.file_url} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginLeft: 8, flexShrink: 0 }}>
                  <button onClick={() => { setEditId(inv.id); setEditForm({ ...inv }); }}
                    style={{ background: 'none', border: `1px solid ${S.faint}`, color: S.muted, borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>✏️</button>
                  <DelBtn onClick={() => deleteInvoice(inv.id)} />
                </div>
              </div>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: S.muted }}>Нет счетов</div>}
    </div>
  );
}
// ─── ЗАДАНИЯ ───────────────────────────────────────────────────────────────────
function TasksTab({ objects, employees }) {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState({ object_id: '', employee_id: '', status: '', priority: '' });
  const emptyForm = { object_id: '', employee_id: '', title: '', description: '', deadline: '', priority: 'medium', status: 'new', created_by: '', file_url: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').order('deadline', { ascending: true });
    setTasks(data || []);
  }

  async function addTask() {
    if (!form.title) return;
    await supabase.from('tasks').insert([{ ...form }]);
    setForm(emptyForm);
    setShowForm(false);
    fetchTasks();
  }

  async function updateStatus(id, status) {
    const updates = { status };
    if (status === 'done') {
      updates.completed_at = new Date().toISOString();
    }
    await supabase.from('tasks').update(updates).eq('id', id);
    fetchTasks();
  }

  async function markDone(id, completedBy) {
    await supabase.from('tasks').update({
      status: 'done',
      completed_by: completedBy,
      completed_at: new Date().toISOString(),
    }).eq('id', id);
    fetchTasks();
  }

  async function deleteTask(id) {
    if (!window.confirm('Удалить задание?')) return;
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  }

  const objName = id => objects.find(o => o.id === id)?.name || '—';
  const empName = id => employees.find(e => e.id === id)?.name || '—';

  const priorityConfig = {
    high:   { label: 'Высокий',  color: '#ef4444', bg: '#ef444422', icon: '🔴' },
    medium: { label: 'Средний',  color: S.yellow,  bg: '#e3b34122', icon: '🟡' },
    low:    { label: 'Низкий',   color: S.green,   bg: '#3fb95022', icon: '🟢' },
  };

  const statusConfig = {
    new:        { label: 'Новое',      color: S.blue,   icon: '📋' },
    inprogress: { label: 'В работе',   color: S.yellow, icon: '🔄' },
    done:       { label: 'Выполнено',  color: S.green,  icon: '✅' },
  };

  const overdueCount = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length;

  const filtered = tasks.filter(t => {
    if (filter.object_id && t.object_id !== filter.object_id) return false;
    if (filter.employee_id && t.employee_id !== filter.employee_id) return false;
    if (filter.status && t.status !== filter.status) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    return true;
  });

  // Sort: high priority first, then by deadline
  const sorted = [...filtered].sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 };
    if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: S.text }}>Задания</div>
          {overdueCount > 0 && (
            <span style={{ background: '#ef444422', color: '#ef4444', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
              🔴 Просрочено: {overdueCount}
            </span>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle(S.accent)}>+ Добавить</button>
      </div>

      {/* Фильтры */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={filter.object_id} onChange={e => setFilter({ ...filter, object_id: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '7px 10px', fontSize: 12 }}>
          <option value=''>Все объекты</option>
          {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <select value={filter.employee_id} onChange={e => setFilter({ ...filter, employee_id: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '7px 10px', fontSize: 12 }}>
          <option value=''>Все сотрудники</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '7px 10px', fontSize: 12 }}>
          <option value=''>Все статусы</option>
          <option value='new'>📋 Новое</option>
          <option value='inprogress'>🔄 В работе</option>
          <option value='done'>✅ Выполнено</option>
        </select>
        <select value={filter.priority} onChange={e => setFilter({ ...filter, priority: e.target.value })}
          style={{ background: S.panel, border: `1px solid ${S.border}`, color: S.muted, borderRadius: 8, padding: '7px 10px', fontSize: 12 }}>
          <option value=''>Все приоритеты</option>
          <option value='high'>🔴 Высокий</option>
          <option value='medium'>🟡 Средний</option>
          <option value='low'>🟢 Низкий</option>
        </select>
        {(filter.object_id || filter.employee_id || filter.status || filter.priority) &&
          <button onClick={() => setFilter({ object_id: '', employee_id: '', status: '', priority: '' })}
            style={{ ...btnStyle(S.faint), fontSize: 12, padding: '6px 10px' }}>✕ Сброс</button>}
      </div>

      {/* Форма добавления */}
      {showForm && (
        <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 20, marginBottom: 16 }}>
          <Field label="Задание *">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder='Залить фундамент...' style={inp} />
          </Field>
          <Field label="Описание">
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder='Подробности задания...' rows={3}
              style={{ ...inp, resize: 'vertical', fontFamily: 'Arial, sans-serif' }} />
          </Field>
          <Field label="Объект">
            <select value={form.object_id} onChange={e => setForm({ ...form, object_id: e.target.value })} style={sel}>
              <option value=''>Выберите объект</option>
              {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Field>
          <Field label="Ответственный">
            <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} style={sel}>
              <option value=''>Выберите сотрудника</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Приоритет">
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={sel}>
                <option value='high'>🔴 Высокий</option>
                <option value='medium'>🟡 Средний</option>
                <option value='low'>🟢 Низкий</option>
              </select>
            </Field>
            <Field label="Дедлайн">
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={inp} />
            </Field>
          </div>
          <Field label="Поставил задачу">
            <input value={form.created_by} onChange={e => setForm({ ...form, created_by: e.target.value })} placeholder='Ваше имя' style={inp} />
          </Field>
          <Field label="Фото или файл">
            <FileUpload onUpload={url => setForm({ ...form, file_url: url })} uploading={uploading} setUploading={setUploading} />
            <FilePreview url={form.file_url} onRemove={() => setForm({ ...form, file_url: '' })} />
          </Field>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={addTask} disabled={uploading} style={btnStyle(S.green)}>Сохранить</button>
            <button onClick={() => setShowForm(false)} style={btnStyle(S.faint)}>Отмена</button>
          </div>
        </div>
      )}

      {sorted.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: S.muted }}>Нет заданий</div>}

      {sorted.map(t => {
        const overdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done';
        const pr = priorityConfig[t.priority] || priorityConfig.medium;
        const st = statusConfig[t.status] || statusConfig.new;
        const isExpanded = expandedId === t.id;

        return (
          <div key={t.id} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${overdue ? '#ef4444' : S.border}`, marginBottom: 10, overflow: 'hidden' }}>
            {/* Шапка карточки */}
            <div style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : t.id)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontSize: 16 }}>{pr.icon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.status === 'done' ? S.muted : S.text, textDecoration: t.status === 'done' ? 'line-through' : 'none', marginBottom: 4 }}>
                    {t.title}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ background: `${st.color}22`, color: st.color, borderRadius: 5, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>
                      {st.icon} {st.label}
                    </span>
                    {t.object_id && <span style={{ fontSize: 11, color: S.muted }}>🏗 {objName(t.object_id)}</span>}
                    {t.employee_id && <span style={{ fontSize: 11, color: S.muted }}>👤 {empName(t.employee_id)}</span>}
                    {t.deadline && <span style={{ fontSize: 11, color: overdue ? '#ef4444' : S.muted }}>📅 {t.deadline}{overdue ? ' ⚠️' : ''}</span>}
                  </div>
                </div>
                <span style={{ color: S.muted, fontSize: 12, flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Раскрытая часть */}
            {isExpanded && (
              <div style={{ borderTop: `1px solid ${S.faint}`, padding: '14px 16px', background: '#0d111755' }}>
                {t.description && (
                  <div style={{ fontSize: 13, color: S.muted, marginBottom: 12, lineHeight: 1.5 }}>{t.description}</div>
                )}

                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: S.muted, flexWrap: 'wrap', marginBottom: 12 }}>
                  {t.created_by && <span>✍️ Поставил: <span style={{ color: S.text }}>{t.created_by}</span></span>}
                  {t.completed_by && <span>✅ Выполнил: <span style={{ color: S.green }}>{t.completed_by}</span></span>}
                  {t.completed_at && <span>🕐 {new Date(t.completed_at).toLocaleDateString('ru-RU')}</span>}
                </div>

                <FilePreview url={t.file_url} />

                {/* Кнопки статусов */}
                {t.status !== 'done' && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, color: S.muted, marginBottom: 8, textTransform: 'uppercase' }}>Изменить статус</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {t.status !== 'new' && (
                        <button onClick={() => updateStatus(t.id, 'new')} style={{ ...btnStyle(S.faint), fontSize: 12, padding: '6px 12px' }}>📋 Новое</button>
                      )}
                      {t.status !== 'inprogress' && (
                        <button onClick={() => updateStatus(t.id, 'inprogress')} style={{ ...btnStyle(S.yellow), fontSize: 12, padding: '6px 12px' }}>🔄 В работе</button>
                      )}
                      <DoneButton onDone={(name) => markDone(t.id, name)} />
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => deleteTask(t.id)}
                    style={{ background: 'none', border: 'none', color: '#ef444466', cursor: 'pointer', fontSize: 12 }}>
                    🗑 Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DoneButton({ onDone }) {
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');

  if (!showInput) {
    return (
      <button onClick={() => setShowInput(true)} style={{ ...btnStyle(S.green), fontSize: 12, padding: '6px 12px' }}>
        ✅ Выполнено
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder='Ваше имя'
        style={{ ...inp, width: 140, fontSize: 12, padding: '6px 10px' }} />
      <button onClick={() => { onDone(name); setShowInput(false); }}
        style={{ ...btnStyle(S.green), fontSize: 12, padding: '6px 12px' }}>Подтвердить</button>
      <button onClick={() => setShowInput(false)}
        style={{ ...btnStyle(S.faint), fontSize: 12, padding: '6px 10px' }}>✕</button>
    </div>
  );
}


// ─── ОТЧЁТЫ ────────────────────────────────────────────────────────────────────
function ReportsTab({ objects }) {
  const [invoices, setInvoices] = useState([]);
  const [timesheet, setTimesheet] = useState([]);
  const [filter, setFilter] = useState({ object_id: '', from_date: '', to_date: '' });

  useEffect(() => { fetchData(); }, [filter]);

  async function fetchData() {
    let iq = supabase.from('invoices').select('*');
    let tq = supabase.from('object_timesheet').select('*');
    if (filter.object_id) { iq = iq.eq('object_id', filter.object_id); tq = tq.eq('object_id', filter.object_id); }
    if (filter.from_date) { iq = iq.gte('date', filter.from_date); tq = tq.gte('date', filter.from_date); }
    if (filter.to_date) { iq = iq.lte('date', filter.to_date); tq = tq.lte('date', filter.to_date); }
    const [{ data: inv }, { data: ts }] = await Promise.all([iq, tq]);
    setInvoices(inv || []);
    setTimesheet(ts || []);
  }

  const fmt = v => new Intl.NumberFormat('ru-RU').format(v);
  const totalMaterials = invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const totalFOT = timesheet.filter(t => t.status === 'worked').reduce((s, t) => s + (t.rate || 0), 0);
  const totalAll = totalMaterials + totalFOT;

  // По объектам
  const byObject = {};
  objects.forEach(o => { byObject[o.id] = { name: o.name, materials: 0, fot: 0 }; });
  invoices.forEach(i => { if (byObject[i.object_id]) byObject[i.object_id].materials += (i.amount || 0); });
  timesheet.filter(t => t.status === 'worked').forEach(t => { if (byObject[t.object_id]) byObject[t.object_id].fot += (t.rate || 0); });

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 16 }}>Отчёты</div>

      {/* Фильтры */}
      <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: S.muted, marginBottom: 10, textTransform: 'uppercase' }}>Период и объект</div>
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
          {(filter.object_id || filter.from_date || filter.to_date) &&
            <button onClick={() => setFilter({ object_id: '', from_date: '', to_date: '' })} style={{ ...btnStyle(S.faint), fontSize: 12, padding: '6px 10px' }}>✕ Сброс</button>}
        </div>
      </div>

      {/* Три отчёта */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 20 }}>
        {[
          { label: '🧾 Расходы по счетам (материалы)', value: totalMaterials, sub: `${invoices.length} счетов`, color: S.yellow },
          { label: '👷 Расходы ФОТ', value: totalFOT, sub: `${timesheet.filter(t => t.status === 'worked').length} записей`, color: S.accent },
          { label: '📊 Итого расходов', value: totalAll, sub: 'материалы + ФОТ', color: S.green },
        ].map((k, i) => (
          <div key={i} style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: S.muted, marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 10, color: S.muted }}>{k.sub}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{fmt(k.value)} ₽</div>
          </div>
        ))}
      </div>

      {/* Разбивка по объектам */}
      <div style={{ fontSize: 13, fontWeight: 700, color: S.text, marginBottom: 10 }}>По объектам</div>
      {Object.values(byObject).filter(o => o.materials > 0 || o.fot > 0).map((o, i) => (
        <div key={i} style={{ background: S.panel, borderRadius: 10, border: `1px solid ${S.border}`, padding: '12px 16px', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: S.text, marginBottom: 8 }}>🏗 {o.name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: 'Материалы', value: o.materials, color: S.yellow },
              { label: 'ФОТ', value: o.fot, color: S.accent },
              { label: 'Итого', value: o.materials + o.fot, color: S.green },
            ].map((k, j) => (
              <div key={j} style={{ background: S.bg, borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: S.muted, textTransform: 'uppercase', marginBottom: 3 }}>{k.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: k.color }}>{fmt(k.value)} ₽</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {Object.values(byObject).every(o => o.materials === 0 && o.fot === 0) && (
        <div style={{ textAlign: 'center', padding: 30, color: S.muted }}>Нет данных за выбранный период</div>
      )}
    </div>
  );
}
