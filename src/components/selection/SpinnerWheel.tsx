'use client'

import { useRef, useState, useImperativeHandle, forwardRef } from 'react'
import type { Restaurant } from '@/lib/types'

const COLORS = ['#FF6B2B', '#FF9A5C', '#FFBA80', '#FFD0A8']
const SIZE = 200
const RADIUS = SIZE / 2
const WHEEL_R = 86

export interface SpinnerWheelHandle {
  spin: () => { restaurant: Restaurant; index: number }
}

interface SpinnerWheelProps {
  restaurants: Restaurant[]
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startAngle))
  const y1 = cy + r * Math.sin(toRad(startAngle))
  const x2 = cx + r * Math.cos(toRad(endAngle))
  const y2 = cy + r * Math.sin(toRad(endAngle))
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
}

export const SpinnerWheel = forwardRef<SpinnerWheelHandle, SpinnerWheelProps>(
  function SpinnerWheel({ restaurants }, ref) {
    const [rotation, setRotation] = useState(0)
    const [isSpinning, setIsSpinning] = useState(false)

    const count = restaurants.length
    const sectorAngle = count > 0 ? 360 / count : 360

    useImperativeHandle(ref, () => ({
      spin() {
        if (isSpinning || count === 0) return { restaurant: restaurants[0], index: 0 }

        setIsSpinning(true)
        const winnerIndex = Math.floor(Math.random() * count)

        // Sectors are drawn starting at -90° (top) going clockwise, so sector i's
        // center sits at angle (-90 + (i + 0.5)*sectorAngle) in the wheel's own frame.
        // The pointer is at the top (-90° / 270°). To bring the winner's center under
        // the pointer we rotate the wheel by -(sectorCenter - (-90)) = -(i+0.5)*sectorAngle.
        const sectorCenter = (winnerIndex + 0.5) * sectorAngle
        // Normalise the current rotation, then add whole turns + the delta to align.
        const current = rotation % 360
        const alignDelta = ((-sectorCenter - current) % 360 + 360) % 360
        const targetRotation = rotation + 360 * 5 + alignDelta

        setRotation(targetRotation)

        setTimeout(() => {
          setIsSpinning(false)
        }, 4200)

        return { restaurant: restaurants[winnerIndex], index: winnerIndex }
      },
    }))

    return (
      <div className="relative w-52 h-52 mx-auto">
        {/* Pointer */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[9px] border-r-[9px] border-t-[18px] border-l-transparent border-r-transparent border-t-foreground"
          style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))' }}
        />

        <svg width="100%" height="100%" viewBox={`0 0 ${SIZE} ${SIZE}`} className="drop-shadow-xl">
          <g
            style={{
              transformOrigin: `${RADIUS}px ${RADIUS}px`,
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {/* Outer ring */}
            <circle cx={RADIUS} cy={RADIUS} r={WHEEL_R + 5} fill="#FFF3EE" />

            {restaurants.map((restaurant, i) => {
              const startAngle = i * sectorAngle - 90
              const endAngle = startAngle + sectorAngle
              const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180)
              const labelR = WHEEL_R * 0.57
              const lx = RADIUS + labelR * Math.cos(midAngle)
              const ly = RADIUS + labelR * Math.sin(midAngle)

              return (
                <g key={restaurant.id}>
                  <path
                    d={describeArc(RADIUS, RADIUS, WHEEL_R, startAngle, endAngle)}
                    fill={COLORS[i % COLORS.length]}
                    stroke="white"
                    strokeWidth={2.5}
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={20}
                    fontWeight={800}
                    style={{ pointerEvents: 'none' }}
                  >
                    {i + 1}
                  </text>
                </g>
              )
            })}

            {/* Hub */}
            <circle cx={RADIUS} cy={RADIUS} r={17} fill="#1C1C1E" />
            <circle cx={RADIUS} cy={RADIUS} r={9} fill="#FF6B2B" />
          </g>
        </svg>
      </div>
    )
  },
)
