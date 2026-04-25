import { Scatter } from 'react-chartjs-2'
import type { FrontierPoint } from '../../types/portfolio'

interface Props {
  frontier: FrontierPoint[]
  currentReturn: number
  currentVol: number
}

export default function FrontierChart({ frontier, currentReturn, currentVol }: Props) {
  const data = {
    datasets: [
      {
        label: 'Efficient Frontier',
        data: frontier.map((p) => ({ x: p.volatility, y: p.return })),
        backgroundColor: 'rgba(29, 158, 117, 0.3)',
        borderColor: '#1D9E75',
        pointRadius: 5,
        pointHoverRadius: 7,
        showLine: true,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Your Portfolio',
        data: [{ x: currentVol, y: currentReturn }],
        backgroundColor: '#EF9F27',
        borderColor: '#EF9F27',
        pointRadius: 10,
        pointHoverRadius: 13,
        pointStyle: 'star' as const,
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Volatility (%)',
          color: '#555',
          font: { family: 'DM Mono', size: 11 },
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#555', font: { family: 'DM Mono', size: 10 } },
      },
      y: {
        title: {
          display: true,
          text: 'Return (%)',
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
        },
      },
      tooltip: {
        backgroundColor: '#1e1e21',
        titleFont: { family: 'DM Mono' },
        bodyFont: { family: 'DM Mono' },
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) =>
            ` Vol: ${ctx.parsed.x.toFixed(1)}%, Ret: ${ctx.parsed.y.toFixed(1)}%`,
        },
      },
    },
  }

  return <Scatter data={data} options={options} />
}
