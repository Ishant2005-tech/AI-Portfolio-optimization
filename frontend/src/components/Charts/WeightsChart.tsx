import { Doughnut } from 'react-chartjs-2'
import type { Allocation } from '../../types/portfolio'

const PALETTE = [
  '#1D9E75', '#378ADD', '#EF9F27', '#E24B4A',
  '#9F77DD', '#0F6E56', '#185FA5', '#BA7517',
  '#A32D2D', '#534AB7',
]

interface Props {
  allocations: Allocation[]
}

export default function WeightsChart({ allocations }: Props) {
  const visible = allocations.filter((a) => a.weight > 0.001)

  const data = {
    labels: visible.map((a) => a.asset),
    datasets: [
      {
        data: visible.map((a) => a.weight_pct),
        backgroundColor: visible.map((_, i) => PALETTE[i % PALETTE.length]),
        borderColor: '#0e0e0f',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
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
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed.toFixed(1)}%`,
        },
      },
    },
  }

  return <Doughnut data={data} options={options} />
}
