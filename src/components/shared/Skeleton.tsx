import React from "react"

interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-black/5 ${className}`}
      aria-hidden="true"
    />
  )
}
