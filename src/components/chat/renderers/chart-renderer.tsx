import React, { useRef } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Download, Maximize2 } from 'lucide-react'

const CHART_COLORS = ["#6366F1", "#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6", "#10B981", "#EC4899", "#3B82F6"]

interface ChartRendererProps {
  spec: any
}

export function ChartRenderer({ spec }: ChartRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  if (!spec) return null
  const { chartType, data, xAxis, yAxis, series, title } = spec

  const commonProps = {
    data,
    margin: { top: 20, right: 20, left: -10, bottom: 0 },
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey={xAxis?.dataKey} tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} height={xAxis?.label ? 50 : 30} label={xAxis?.label ? { value: xAxis.label, position: 'insideBottom', offset: -5, fill: "var(--text-muted)", fontSize: 13 } : undefined} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={yAxis?.label ? 60 : 40} label={yAxis?.label ? { value: yAxis.label, angle: -90, position: 'insideLeft', offset: 0, style: { textAnchor: 'middle', fill: "var(--text-muted)", fontSize: 13 } } : undefined} />
            <Tooltip cursor={{ fill: "var(--bg-elevated)", opacity: 0.5 }} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)' }} />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 20 }} />
            {(series || []).map((s: any, i: number) => (
              <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color || CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} animationDuration={1000} maxBarSize={50} />
            ))}
          </BarChart>
        )
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey={xAxis?.dataKey} tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} height={xAxis?.label ? 50 : 30} label={xAxis?.label ? { value: xAxis.label, position: 'insideBottom', offset: -5, fill: "var(--text-muted)", fontSize: 13 } : undefined} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={yAxis?.label ? 60 : 40} label={yAxis?.label ? { value: yAxis.label, angle: -90, position: 'insideLeft', offset: 0, style: { textAnchor: 'middle', fill: "var(--text-muted)", fontSize: 13 } } : undefined} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)' }} />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 20 }} />
            {(series || []).map((s: any, i: number) => (
              <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color || CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={3} dot={{ r: 4, fill: "var(--bg-surface)", strokeWidth: 2 }} activeDot={{ r: 6 }} animationDuration={1000} />
            ))}
          </LineChart>
        )
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              {(series || []).map((s: any, i: number) => (
                <linearGradient key={s.dataKey} id={`grad_${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color || CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={s.color || CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey={xAxis?.dataKey} tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} dy={10} height={xAxis?.label ? 50 : 30} label={xAxis?.label ? { value: xAxis.label, position: 'insideBottom', offset: -5, fill: "var(--text-muted)", fontSize: 13 } : undefined} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={yAxis?.label ? 60 : 40} label={yAxis?.label ? { value: yAxis.label, angle: -90, position: 'insideLeft', offset: 0, style: { textAnchor: 'middle', fill: "var(--text-muted)", fontSize: 13 } } : undefined} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)' }} />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 20 }} />
            {(series || []).map((s: any, i: number) => (
              <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color || CHART_COLORS[i % CHART_COLORS.length]} fill={`url(#grad_${i})`} strokeWidth={3} animationDuration={1000} />
            ))}
          </AreaChart>
        )
      case "pie":
      case "donut":
        const pieKey = series?.[0]?.dataKey || "value"
        const innerRadius = chartType === 'donut' ? 60 : 0
        return (
          <PieChart>
            <Pie data={data} dataKey={pieKey} nameKey={xAxis?.dataKey} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={100} animationDuration={1000} stroke="var(--bg-card)" strokeWidth={2}>
              {data?.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)' }} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
          </PieChart>
        )
      default:
        return (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm border border-dashed border-[var(--border)] rounded-lg">
            Unsupported chart type: {chartType}
          </div>
        )
    }
  }

  const handleDownload = () => {
    if (!containerRef.current) return
    const svgElement = containerRef.current.querySelector('.recharts-wrapper svg')
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    
    let svgString = svgData
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    const svgBase64 = btoa(unescape(encodeURIComponent(svgString)))
    const url = `data:image/svg+xml;base64,${svgBase64}`
    
    img.onload = () => {
      const scale = 2
      const width = svgElement.clientWidth || 800
      const height = svgElement.clientHeight || 320
      
      canvas.width = width * scale
      canvas.height = height * scale
      if (ctx) {
          ctx.scale(scale, scale)
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0)
          const pngUrl = canvas.toDataURL("image/png")
          const link = document.createElement('a')
          link.href = pngUrl
          link.download = `${title || 'chart'}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
      }
    }
    img.src = url
  }

  return (
    <div ref={containerRef} className="mt-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-sm p-5 relative group w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[var(--text-primary)] tracking-tight">{title || 'Data Visualization'}</h3>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleDownload} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors" title="Download PNG">
            <Download size={16} />
          </button>
          <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors" title="Full Screen">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() as any}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
