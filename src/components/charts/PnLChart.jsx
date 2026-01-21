import React, { useMemo, useState } from 'react';

export default function PnLChart({ transactions, width = 120, height = 60 }) {
    const [currency, setCurrency] = useState('coins'); // 'coins' | 'cash'

    // 1. Process Data (Hourly Aggregation)
    const dataPoints = useMemo(() => {
        // Filter by currency
        const filtered = transactions.filter(t => (t.currency || 'coins') === currency);

        // Sort by date (oldest first)
        const sorted = [...filtered].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (sorted.length === 0) return [0, 0];

        // Group by hour
        const hourlyPnL = new Map();
        let runningTotal = 0;

        sorted.forEach(t => {
            const date = new Date(t.timestamp);
            date.setMinutes(0, 0, 0); // Bucket by hour
            const key = date.getTime();

            if (t.type === 'earn') runningTotal += t.amount;
            else if (t.type === 'spend') runningTotal -= t.amount;

            // Store the running total for this hour
            hourlyPnL.set(key, runningTotal);
        });

        const points = Array.from(hourlyPnL.entries())
            .sort((a, b) => a[0] - b[0])
            .map(entry => entry[1]);

        if (points.length === 0) return [0, 0];
        // Ensure visual continuity from 0 if only one point
        if (points.length === 1) return [0, points[0]];
        return points;
    }, [transactions, currency]);

    // 2. Calculate Scaling
    const { min, max, range } = useMemo(() => {
        if (dataPoints.length === 0) return { min: 0, max: 0, range: 0 };
        const min = Math.min(...dataPoints);
        const max = Math.max(...dataPoints);
        // Add some padding
        const padding = Math.max(Math.abs(min), Math.abs(max)) * 0.1 || (currency === 'cash' ? 1 : 10);
        return {
            min: min - padding,
            max: max + padding,
            range: (max + padding) - (min - padding) || 10
        };
    }, [dataPoints, currency]);

    // 3. Generate SVG Path
    const pathD = useMemo(() => {
        if (dataPoints.length < 2) return `M 0,${height / 2} L ${width},${height / 2}`;

        const stepX = width / (dataPoints.length - 1);

        return dataPoints.map((val, i) => {
            const x = i * stepX;
            // Invert Y axis (SVG 0 is top)
            // Normalize val between 0 and 1, then scale to height
            const normalizedY = (val - min) / range;
            const y = height - (normalizedY * height);
            return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
        }).join(' ');
    }, [dataPoints, width, height, min, range]);

    // 4. Determine Color & Hover
    const lastValue = dataPoints[dataPoints.length - 1];
    const isPositive = lastValue >= 0;
    const color = isPositive ? '#86efac' : '#fca5a5'; // green-300 : red-300

    const [hoveredPoint, setHoveredPoint] = React.useState(null);

    const handleMouseMove = (e) => {
        if (dataPoints.length < 2) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const stepX = width / (dataPoints.length - 1);
        const index = Math.min(Math.max(Math.round(x / stepX), 0), dataPoints.length - 1);

        // Find rough time for this point (mock logic since we don't store exact map back easily here without passing it)
        // For simplicity, we just show value. 
        setHoveredPoint({ index, value: dataPoints[index] });
    };

    const formatValue = (val) => {
        if (currency === 'cash') return `${val >= 0 ? '+' : ''}$${Math.abs(val).toFixed(2)}`;
        return `${val >= 0 ? '+' : ''}${val}`;
    };

    return (
        <div className="flex flex-col items-center w-full relative h-full">
            {/* Toggle - Absolute Top Right (Larger now) */}
            <div className="absolute -top-1 right-0 z-20 flex bg-black/20 rounded-lg p-0.5">
                <button
                    onClick={() => setCurrency('coins')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${currency === 'coins' ? 'bg-yellow-400 text-yellow-900' : 'text-white/50 hover:text-white'}`}
                >
                    Coins
                </button>
                <button
                    onClick={() => setCurrency('cash')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${currency === 'cash' ? 'bg-green-500 text-white' : 'text-white/50 hover:text-white'}`}
                >
                    Cash
                </button>
            </div>

            {/* The Number - Compact */}
            <p className={`text-lg font-bold -mt-1 mb-0 z-10 ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
                {hoveredPoint ? formatValue(hoveredPoint.value) : formatValue(lastValue)}
            </p>

            {/* The Chart - Responsive */}
            <div
                className="w-full flex-1 flex items-center justify-center min-h-[20px] relative cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredPoint(null)}
            >
                {hoveredPoint && (
                    <div
                        className="absolute top-0 bottom-0 w-[1px] bg-white/50 pointer-events-none"
                        style={{ left: `${(hoveredPoint.index / (dataPoints.length - 1)) * 100}%` }}
                    />
                )}

                <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Zero Line (Reference) */}
                    <line
                        x1="0"
                        y1={height - ((0 - min) / range * height)}
                        x2={width}
                        y2={height - ((0 - min) / range * height)}
                        stroke="rgba(255,255,255,0.2)"
                        strokeDasharray="4 2"
                        strokeWidth="1"
                    />

                    {/* Chart Line */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth="0.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-md"
                    />
                </svg>
            </div>

            {/* Legend Label */}
            <p className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white/30 uppercase tracking-widest pointer-events-none">
                PnL History
            </p>
        </div>
    );
}
