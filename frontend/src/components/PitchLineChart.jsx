import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

/**
 * PitchLineChart — simulates a pitch variation line chart.
 * In a real implementation, pitch data would come from the backend.
 */
export default function PitchLineChart({ pitchVariation }) {
  // Generate a realistic-looking pitch curve based on pitchVariation value
  const points = 20
  const base = 200
  const variance = pitchVariation * 300

  const labels = Array.from({ length: points }, (_, i) => `${(i * 3)}s`)
  const pitchData = Array.from({ length: points }, (_, i) => {
    const noise = (Math.sin(i * 1.3) + Math.cos(i * 0.7)) * variance / 2
    return Math.max(80, base + noise + (Math.random() - 0.5) * variance * 0.3)
  })

  const data = {
    labels,
    datasets: [{
      label: 'Pitch (Hz)',
      data: pitchData,
      borderColor: 'rgba(99,102,241,0.9)',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: 'rgba(99,102,241,1)',
      borderWidth: 2,
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
        callbacks: {
          label: ctx => ` ${Math.round(ctx.parsed.y)} Hz`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', maxTicksLimit: 6 },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#64748b', callback: v => `${v}Hz` },
        border: { display: false },
      },
    },
  }

  return (
    <div className="h-48">
      <Line data={data} options={options} />
    </div>
  )
}
