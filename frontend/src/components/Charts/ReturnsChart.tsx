import { Bar } from 'react-chartjs-2'
import type { Allocation } from '../../types/portfolio'

interface Props {
  allocations: Allocation[]
}

export default function ReturnsChart({ allocations }: Props) {
  const visible = allocations.filter((a) => a.weight > 0.001)

  const data = {
    labels: visible.map((a) => a.asset),
    datasets: [
      {
        label: 'Annual Return (%)',
        data: visible.map((a) => a.annual_return),
        backgroundColor: 'rgba(29, 158, 117, 0.7)',
        borderColor: '#1D9E75',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Annual Volatility (%)',
        data: visible.map((a) => a.annual_vol),
        backgroundColor: 'rgba(239, 159, 39, 0.7)',
        borderColor: '#EF9F27',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#555', font: { family: 'DM Mono', size: 10 } },
      },
      y: {
        title: {
          display: true,
          text: '%',
          color: '#555',
          font: { family: 'DM Mono', size: 11 },
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#555', font: { family: 'DM Mono', size: 10 } },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9a9a9a',
          font: { family: 'DM Mono', size: 11 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#1e1e21',
        titleFont: { family: 'DM Mono' },
        bodyFont: { family: 'DM Mono' },
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      },
    },
  }

  return <Bar data={data} options={options} />
}
