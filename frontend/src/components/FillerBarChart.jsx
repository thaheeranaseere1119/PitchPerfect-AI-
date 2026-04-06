import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function FillerBarChart({ fillers }) {
  const entries = Object.entries(fillers)

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No filler words detected 🎉
      </div>
    )
  }

  const data = {
    labels: entries.map(([word]) => word),
    datasets: [{
      label: 'Count',
      data: entries.map(([, count]) => count),
      backgroundColor: [
        'rgba(239,68,68,0.7)',
        'rgba(249,115,22,0.7)',
        'rgba(234,179,8,0.7)',
        'rgba(168,85,247,0.7)',
        'rgba(59,130,246,0.7)',
        'rgba(16,185,129,0.7)',
      ],
      borderRadius: 8,
      borderSkipped: false,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.95)',
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { weight: '600' } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#64748b', stepSize: 1 },
        border: { display: false },
      },
    },
  }

  return (
    <div className="h-48">
      <Bar data={data} options={options} />
    </div>
  )
}
