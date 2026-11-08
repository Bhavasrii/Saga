import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BookOpen, Users, Eye, MessageSquare, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const STATUS_COLORS = {
  Published: '#1f7a52',
  Scheduled: '#38bdf8',
  'Under review': '#f59e0b',
  Draft: '#a8a29e',
};

const ROLE_COLORS = ['#1f7a52', '#0284c7', '#78716c', '#a8a29e'];

export const Insights = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/reports/summary');
      if (data.success && data.reports) {
        setReports(data.reports);
      }
    } catch (err) {
      setError('Unable to load platform insights.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling publication insights..." />;
  }

  if (error || !reports) {
    return <ErrorState message={error || 'Unable to load insights.'} onRetry={fetchSummary} />;
  }

  // Format charts data
  const storiesByStatusData = [
    { name: 'Published', count: reports.storiesByStatus?.published || 0, fill: '#1f7a52' },
    { name: 'Under review', count: reports.storiesByStatus?.pending || 0, fill: '#f59e0b' },
    { name: 'Scheduled', count: reports.storiesByStatus?.scheduled || 0, fill: '#38bdf8' },
    { name: 'Drafts', count: reports.storiesByStatus?.draft || 0, fill: '#a8a29e' },
  ];

  const membersByRoleData = [
    { name: 'Readers', value: reports.membersByRole?.reader || 0 },
    { name: 'Writers', value: reports.membersByRole?.author || 0 },
    { name: 'Editors', value: reports.membersByRole?.editor || 0 },
    { name: 'Admins', value: reports.membersByRole?.admin || 0 },
  ].filter((item) => item.value > 0);

  const topicData = (reports.storiesPerTopic || []).map((t) => ({
    name: t.name,
    stories: t.count,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Insights</h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Editorial metrics, readership volume, and platform performance.
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total reads */}
        <div className="bg-white p-5 rounded-lg border border-borderWarm shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-forest-tint text-forest flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">
              Total Reads
            </p>
            <h3 className="text-2xl font-bold text-ink font-serif mt-0.5">
              {(reports.totals?.views || 0).toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Stories published */}
        <div className="bg-white p-5 rounded-lg border border-borderWarm shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-forest-tint text-forest flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">
              Published Stories
            </p>
            <h3 className="text-2xl font-bold text-ink font-serif mt-0.5">
              {reports.totals?.publishedStories || 0}
              <span className="text-xs text-ink-muted font-normal ml-1">
                / {reports.totals?.stories || 0} total
              </span>
            </h3>
          </div>
        </div>

        {/* Community Members */}
        <div className="bg-white p-5 rounded-lg border border-borderWarm shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">
              Community Members
            </p>
            <h3 className="text-2xl font-bold text-ink font-serif mt-0.5">
              {reports.totals?.members || 0}
            </h3>
          </div>
        </div>

        {/* Comments review queue */}
        <div className="bg-white p-5 rounded-lg border border-borderWarm shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-wider font-medium">
              Responses for Review
            </p>
            <h3 className="text-2xl font-bold text-ink font-serif mt-0.5">
              {reports.pendingComments || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stories by Status */}
        <div className="bg-white p-6 rounded-lg border border-borderWarm shadow-sm">
          <h3 className="font-serif text-lg font-bold text-ink mb-4">
            Stories by Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storiesByStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#636059' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#636059' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    borderColor: '#e7e3da',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Members by Role */}
        <div className="bg-white p-6 rounded-lg border border-borderWarm shadow-sm">
          <h3 className="font-serif text-lg font-bold text-ink mb-4">
            Members by Role
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={membersByRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {membersByRoleData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    borderColor: '#e7e3da',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stories per Topic */}
        <div className="bg-white p-6 rounded-lg border border-borderWarm shadow-sm">
          <h3 className="font-serif text-lg font-bold text-ink mb-4">
            Stories per Topic
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#636059' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#636059' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    borderColor: '#e7e3da',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="stories" fill="#1f7a52" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Most Read Stories */}
        <div className="bg-white p-6 rounded-lg border border-borderWarm shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-ink mb-4 flex items-center justify-between">
              <span>Top 5 Most-Read Stories</span>
              <TrendingUp className="w-4 h-4 text-forest" />
            </h3>
            <div className="divide-y divide-borderWarm/60">
              {(reports.topStories || []).map((story, idx) => (
                <div key={story._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5 min-w-0 pr-3">
                    <span className="font-serif font-bold text-ink-light w-4 text-center">
                      {idx + 1}
                    </span>
                    <Link
                      to={`/story/${story.slug}`}
                      className="font-medium text-ink hover:text-forest truncate"
                    >
                      {story.title}
                    </Link>
                  </div>
                  <span className="text-ink-muted font-medium whitespace-nowrap">
                    {story.views.toLocaleString()} reads
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-borderWarm/60 text-right">
            <Link
              to="/all-stories"
              className="text-xs text-forest font-medium hover:underline"
            >
              Manage all stories &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
