"use client"

import React from "react"
// import { SparklesCore } from "@/components/ui/sparkles"
// Update the import path below if the file exists elsewhere:
import { SparklesCore } from "./sparkles.js"

export function SparklesPreview() {

  return (

    <div className="h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">

      <h1 className="text-7xl font-bold text-white relative z-20">
        CareerOS
      </h1>

      <div className="w-[40rem] h-40 relative">

        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={400}
          className="w-full h-full"
          particleColor="#ffffff"
        />

      </div>

    </div>

  )

}