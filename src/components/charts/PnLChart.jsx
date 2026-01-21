import React, { useMemo } from 'react';

export default function PnLChart({ transactions, width = 120, height = 60 }) {
    // 1. Process Data
    // 1. Process Data (Hourly Aggregation)
    const dataPoints = useMemo(() => {
        // Sort by date (oldest first)
        const sorted = [...transactions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

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
    }, [transactions]);

    // 2. Calculate Scaling
    const { min, max, range } = useMemo(() => {
        if (dataPoints.length === 0) return { min: 0, max: 0, range: 0 };
        const min = Math.min(...dataPoints);
        const max = Math.max(...dataPoints);
        // Add some padding
        const padding = Math.max(Math.abs(min), Math.abs(max)) * 0.1 || 10;
        return {
            min: min - padding,
            max: max + padding,
            range: (max + padding) - (min - padding) || 10
        };
    }, [dataPoints]);

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

    // 4. Determine Color
    const lastValue = dataPoints[dataPoints.length - 1];
    const isPositive = lastValue >= 0;
    const color = isPositive ? '#86efac' : '#fca5a5'; // green-300 : red-300

    return (
        <div className="flex flex-col items-center">
            {/* The Number */}
            <p className={`text-2xl font-bold ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
                {isPositive ? '+' : ''}{lastValue}
            </p>

            {/* The Chart - Responsive */}
            <div className="w-full h-full flex items-center justify-center min-h-[60px]">
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
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-md"
                    />
                </svg>
            </div>

            <p className="text-white/80 text-xs mt-2">Historic Net PnL</p>
        </div>
    );
}
