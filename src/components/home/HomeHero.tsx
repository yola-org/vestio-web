"use client"

import CallToAction from "./CallToAction"

export default function HomeHero() {
  return (
    <div className="main-container mt-3">
      <CallToAction authenticated compact tone="orange" />
    </div>
  )
}
