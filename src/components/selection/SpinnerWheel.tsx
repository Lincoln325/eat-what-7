'use client'

import { useRef, useState, useImperativeHandle, forwardRef } from 'react'
import type { Restaurant } from '@/lib/types'

const COLORS = ['#DC2626', '#A16207', '#15803d']
const SIZE = 240
const RADIUS = SIZE / 2
const POINTER_OFFSET = 12

export interface SpinnerWheelHandle {
  spin: () => Restaurant
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
    const wheelRef = useRef<SVGGElement>(null)
    const [rotation, setRotation] = useState(0)
    const [isSpinning, setIsSpinning] = useState(false)

    const count = restaurants.length
    const sectorAngle = count > 0 ? 360 / count : 360

    useImperativeHandle(ref, () => ({
      spin() {
        if (isSpinning || count === 0) return restaurants[0]

        setIsSpinning(true)
        const extraSpins = 1440 + Math.floor(Math.random() * 720)
        const winnerIndex = Math.floor(Math.random() * count)
        // Place winner at top (270deg = 12 o'clock in SVG coords, adjusted for sector center)
        const winnerOffset = 270 - (winnerIndex * sectorAngle + sectorAngle / 2)
        const targetRotation = rotation + extraSpins + ((winnerOffset - (rotation % 360) + 360) % 360)

        setRotation(targetRotation)

        setTimeout(() => {
          setIsSpinning(false)
        }, 4200)

        return restaurants[winnerIndex]
      },
    }))

    return (
      <div className="relative flex items-center justify-center" style={{ width: SIZE + POINTER_OFFSET * 2, height: SIZE + POINTER_OFFSET * 2 }}>
        {/* Pointer */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
          style={{ marginTop: -2 }}
        >
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-foreground drop-shadow-md" />
        </div>

        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <g
            ref={wheelRef}
            style={{
              transformOrigin: `${RADIUS}px ${RADIUS}px`,
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {restaurants.map((restaurant, i) => {
              const startAngle = i * sectorAngle - 90
              const endAngle = startAngle + sectorAngle
              const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180)
              const labelR = RADIUS * 0.62
              const lx = RADIUS + labelR * Math.cos(midAngle)
              const ly = RADIUS + labelR * Math.sin(midAngle)

              return (
                <g key={restaurant.id}>
                  <path
                    d={describeArc(RADIUS, RADIUS, RADIUS - 2, startAngle, endAngle)}
                    fill={COLORS[i % COLORS.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={count === 1 ? 14 : count === 2 ? 12 : 10}
                    fontWeight="bold"
                    className="font-heading"
                    style={{ pointerEvents: 'none' }}
                  >
                    {restaurant.name.length > 10 ? restaurant.name.slice(0, 9) + '…' : restaurant.name}
                  </text>
                </g>
              )
            })}
          </g>

          {/* Center cap */}
          <circle cx={RADIUS} cy={RADIUS} r={16} fill="white" stroke="#e5e7eb" strokeWidth={2} />
        </svg>
      </div>
    )
  },
)
