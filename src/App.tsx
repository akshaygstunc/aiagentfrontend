import { useEffect, useState } from 'react';
import {
  PauseCircle,
  PlayCircle,
  Upload,
  PhoneCall,
  CalendarRange,
  ArrowRight,
} from 'lucide-react';
import { api } from './services/api';
import './styles/global.css';

type Campaign = {
  id: string;
  name: string;
  status: string;
  isPaused: boolean;
  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
  contacts: { id: string; phone: string; status: string; name?: string | null }[];
};

const emptyForm = {
  name: '',
  dailyStartTime: '09:00',
  dailyEndTime: '18:00',
  startDate: '',
  endDate: '',
  timezone: 'Asia/Kolkata',
  bolnaAgentId: '',
  fromNumber: '',
};

export default function App() {
  const [showAbout, setShowAbout] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchCampaigns = async () => {
    const { data } = await api.get('/calls/campaigns');
    setCampaigns(data);
    if (!selectedCampaignId && data[0]) setSelectedCampaignId(data[0].id);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/calls/campaigns', form);
    setForm(emptyForm);
    fetchCampaigns();
  };

  const uploadContacts = async () => {
    if (!selectedCampaignId || !file) return;
    const formData = new FormData();
    formData.append('file', file);

    await api.post(`/calls/campaigns/${selectedCampaignId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setFile(null);
    fetchCampaigns();
  };

  const toggleCampaign = async (campaign: Campaign) => {
    await api.patch(`/calls/campaigns/${campaign.id}/${campaign.isPaused ? 'resume' : 'pause'}`);
    fetchCampaigns();
  };

  if (showAbout) {
    return (
      <div className="about-screen">
        <div className="about-wrapper">
          <div className="about-left-panel">
            <div className="about-logo-glow" />
            <div className="about-logo-card">
              <img
                src="/logo.png"
                alt="Ebench AI logo"
                className="about-logo-image"
              />
              <h2>Ebench AI</h2>
              <p>
                Premium AI calling infrastructure for smart outbound campaigns,
                lead orchestration, and voice-driven engagement.
              </p>
            </div>
          </div>

          <div className="about-right-panel">
            <span className="eyebrow">About us</span>
            <h1>ebench AI agent</h1>
            <p className="about-copy">
              Build and run AI-powered calling campaigns with a modern command center
              designed for scheduling, lead upload, pause and resume controls, and
              seamless Bolna-powered voice operations.
            </p>
            <p className="about-copy muted">
              Designed for teams that want a luxury interface with practical execution,
              Ebench helps you organize campaigns, import contact sheets, and manage
              calling windows from a single clean platform.
            </p>

            <div className="about-cta-row">
              <button className="primary-btn hero-btn" onClick={() => setShowAbout(false)}>
                Try Now
                <ArrowRight size={18} />
              </button>
              <button className="ghost-btn" onClick={() => setShowAbout(false)}>
                Enter Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <img
            src="/logo.png"
            height={150}
            width={150}
            style={{ background: 'white' }}
            alt="Ebench AI logo"
          />
          <div>
            <p className="eyebrow">Ebench AI calling Agent</p>
            <h1>Calling Command Center</h1>
          </div>
        </div>
        <p className="muted">
          Upload Excel leads, define campaign calling windows, pause or resume instantly,
          and let Ebench Voice AI run outreach from a polished admin panel.
        </p>
      </aside>

      <main className="content">
        <section className="hero-card glass">
          <div>
            <p className="eyebrow">AI voice operations</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span>{campaigns.length}</span>
              <p>Campaigns</p>
            </div>
            <div className="stat-card">
              <span>{campaigns.reduce((a, c) => a + c.contacts.length, 0)}</span>
              <p>Contacts</p>
            </div>
            <div className="stat-card">
              <span>{campaigns.filter((c) => !c.isPaused).length}</span>
              <p>Active</p>
            </div>
          </div>
        </section>

        <section className="grid two-col">
          <form className="panel" onSubmit={createCampaign}>
            <div className="panel-head">
              <CalendarRange size={18} />
              <h3>Create Campaign</h3>
            </div>

            <div className="form-grid">
              <input
                placeholder="Campaign name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
              <input
                type="time"
                value={form.dailyStartTime}
                onChange={(e) => setForm({ ...form, dailyStartTime: e.target.value })}
                required
              />
              <input
                type="time"
                value={form.dailyEndTime}
                onChange={(e) => setForm({ ...form, dailyEndTime: e.target.value })}
                required
              />
              <input
                placeholder="Bolna agent ID (optional override)"
                value={form.bolnaAgentId}
                onChange={(e) => setForm({ ...form, bolnaAgentId: e.target.value })}
              />
              <input
                placeholder="From number"
                value={form.fromNumber}
                onChange={(e) => setForm({ ...form, fromNumber: e.target.value })}
              />
              <input
                placeholder="Timezone"
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              />
            </div>

            <button className="primary-btn" type="submit">
              Save campaign
            </button>
          </form>

          <div className="panel">
            <div className="panel-head">
              <Upload size={18} />
              <h3>Upload Excel Contacts</h3>
            </div>

            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
            >
              <option value="">Select campaign</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>

            <label className="upload-zone">
              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                hidden
              />
              <span>{file ? file.name : 'Choose Excel or CSV file'}</span>
            </label>

            <button className="primary-btn" type="button" onClick={uploadContacts}>
              Import leads
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <PhoneCall size={18} />
            <h3>Campaigns</h3>
          </div>

          <div className="campaign-grid">
            {campaigns.map((campaign) => (
              <article className="campaign-card" key={campaign.id}>
                <div className="campaign-card-top">
                  <div>
                    <h4>{campaign.name}</h4>
                    <p>
                      {campaign.dailyStartTime} - {campaign.dailyEndTime}
                    </p>
                  </div>

                  <button className="icon-btn" onClick={() => toggleCampaign(campaign)}>
                    {campaign.isPaused ? <PlayCircle size={20} /> : <PauseCircle size={20} />}
                  </button>
                </div>

                <div className="pill-row">
                  <span className="pill">{campaign.status}</span>
                  <span className="pill soft">{campaign.contacts.length} contacts</span>
                </div>

                <div className="contact-list">
                  {campaign.contacts.map((contact) => (
                    <div className="contact-row" key={contact.id}>
                      <span>{contact.name || 'Unknown Lead'}</span>
                      <span>{contact.phone}</span>
                      <span>{contact.status}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}